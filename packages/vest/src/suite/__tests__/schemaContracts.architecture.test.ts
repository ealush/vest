import { describe, expect, it, vi } from 'vitest';
import { EnforceSchemaError, enforce } from 'n4s';

import { create, group, mode, Modes, test } from '../../vest';

declare global {
  namespace n4s {
    interface EnforceMatchers {
      architectureNumber: (value: string) => { pass: boolean; type: number };
      architectureBox: (value: number) => {
        pass: boolean;
        type: { value: number };
      };
      architectureBoom: (value: string) => { pass: boolean; type: string };
      architectureConditionalMapped: (value: string) => {
        pass: boolean;
        type: string;
      };
      architectureBoomOnMapped: (value: string) => {
        pass: boolean;
        type: string;
      };
      architectureFrameworkBoom: (value: string) => {
        pass: boolean;
        type: string;
      };
      architectureUserEnforceBoom: (value: string) => {
        pass: boolean;
        type: string;
      };
      architectureThrowPrimitive: (value: string) => {
        pass: boolean;
        type: string;
      };
    }
  }
}
const architectureBoomError = new Error('parser boom');
const architectureMappedBoomError = new Error('mapped parser boom');
enforce.extend({
  architectureNumber: () => ({ pass: false, type: 2 }),
  architectureBox: (value: number) => ({ pass: true, type: { value } }),
  architectureBoom: () => {
    throw architectureBoomError;
  },
  architectureConditionalMapped: (value: string) =>
    value === 'bad'
      ? { pass: false, type: 'MAPPED' }
      : { pass: true, type: value },
  architectureBoomOnMapped: (value: string) => {
    if (value === 'MAPPED') throw architectureMappedBoomError;
    return { pass: true, type: value };
  },
  architectureFrameworkBoom: (value: string) => {
    if (value === 'MAPPED') {
      throw new Error('structural mapping fault');
    }
    return { pass: true, type: value };
  },
  architectureUserEnforceBoom: (value: string) => {
    // A user parser throwing the PUBLIC EnforceSchemaError must NOT be
    // mistaken for a framework mapping-unavailable fault: it propagates.
    if (value === 'MAPPED') {
      throw new EnforceSchemaError('user parser fault');
    }
    return { pass: true, type: value };
  },
  architectureThrowPrimitive: (value: string) => {
    if (value === 'MAPPED') {
      throw 'primitive boom';
    }
    return { pass: true, type: value };
  },
});

function mappingSchema() {
  return enforce.shape({
    a: enforce.architectureNumber().architectureBox(),
    b: enforce.isString(),
  });
}

function deferred() {
  let release: () => void = () => {};
  const promise = new Promise<void>(resolve => {
    release = resolve;
  });
  return { promise, release };
}
const flush = () =>
  new Promise<void>(resolve => {
    setImmediate(resolve);
  });

describe('schema contracts: architectural boundaries', () => {
  it('[ARCH-MAPPING] a focused callback receives supplied input for untouched fields', () => {
    const seen = vi.fn();
    const suite = create(data => {
      seen(data.a);
      test('b', () => true);
    }, mappingSchema());
    const result = suite.changed('b').run({ a: 'raw', b: 'ok' });
    expect(result.isValid()).toBe(true);
    // The untouched parser chain never runs to prepare callback data.
    expect(seen).toHaveBeenCalledExactlyOnceWith('raw');
    expect(result.value).toEqual({ b: 'ok' });
  });

  it('[ARCH-UNION] an untouched union is never probed for a focused callback', () => {
    const first = vi.fn(() => true);
    const second = vi.fn(() => true);
    const callback = vi.fn();
    const suite = create(
      data => {
        callback(data);
        test('b', () => true);
      },
      enforce.shape({
        a: enforce.isArrayOf(
          enforce.condition(first).architectureBox(),
          enforce.condition(second),
        ),
        b: enforce.isString(),
      }),
    );
    const result = suite.changed('b').run({ a: [2], b: 'ok' });
    expect(result.isValid()).toBe(true);
    expect(callback).toHaveBeenCalledExactlyOnceWith({ a: [2], b: 'ok' });
    expect(first).not.toHaveBeenCalled();
    expect(second).not.toHaveBeenCalled();
  });

  it('[ARCH-MAPPING] selected parser failure remains a validation error', () => {
    const suite = create(() => {
      test('a', () => true);
    }, mappingSchema());
    const result = suite.changed('a').run({ a: 'raw', b: 'ok' });
    expect(result.hasErrors('a')).toBe(true);
    expect(result.value).toBeUndefined();
  });

  it('[ARCH-MAPPING] a throwing parser on a skipped field never runs', () => {
    const selected = vi.fn(() => true);
    const callback = vi.fn();
    const suite = create(
      data => {
        callback(data);
        test('b', () => true);
      },
      enforce.shape({
        a: enforce.architectureBoom(),
        b: enforce.condition(selected),
      }),
    );

    const result = suite.changed('b').focus({ skip: 'a' }).run({
      a: 'x',
      b: 'y',
    });

    expect(result.hasErrors()).toBe(false);
    expect(selected).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledExactlyOnceWith({ a: 'x', b: 'y' });
    // Executing the parser propagates its cause by identity.
    expect(() => suite.run({ a: 'x', b: 'y' })).toThrow(architectureBoomError);
  });

  it('[ARCH-MAPPING] a failing parser stage short-circuits later stages', () => {
    const callback = vi.fn();
    const suite = create(
      data => {
        callback(data);
        test('b', () => true);
      },
      enforce.shape({
        a: enforce.architectureConditionalMapped().architectureBoomOnMapped(),
        b: enforce.isString(),
      }),
    );

    const valid = suite.run({ a: 'good', b: 'ok' });
    expect(valid.isValid()).toBe(true);
    const delivered = valid.value as Record<string, unknown>;

    // The first stage fails validation, so the throwing stage never runs:
    // there is no second pass that ignores verdicts.
    const failed = suite.run({ a: 'bad', b: 'ok' });
    expect(failed.hasErrors('a')).toBe(true);
    expect(callback).toHaveBeenLastCalledWith({ a: 'bad', b: 'ok' });
    expect(delivered).toEqual({ a: 'good', b: 'ok' });

    const recovery = suite.run({ a: 'fine', b: 'ok' });
    expect(recovery.isValid()).toBe(true);
    expect(recovery.value).toEqual({ a: 'fine', b: 'ok' });
  });

  it.each([
    ['architectureFrameworkBoom', 'structural mapping fault'],
    ['architectureUserEnforceBoom', 'user parser fault'],
  ] as const)(
    '[ARCH-MAPPING] %s thrown during validation propagates with its message',
    (rule, message) => {
      const callback = vi.fn();
      const suite = create(
        data => {
          callback(data);
          test('b', () => true);
        },
        enforce.shape({
          a: (enforce as any)[rule](),
          b: enforce.isString(),
        }),
      );
      expect(suite.run({ a: 'good', b: 'ok' }).isValid()).toBe(true);
      let thrown: unknown;
      try {
        suite.run({ a: 'MAPPED', b: 'ok' });
      } catch (error) {
        thrown = error;
      }
      expect(thrown).toBeInstanceOf(Error);
      expect((thrown as Error).message).toBe(message);
      if (rule === 'architectureUserEnforceBoom') {
        expect(thrown).toBeInstanceOf(EnforceSchemaError);
      }
      expect(callback).toHaveBeenCalledTimes(1);
    },
  );

  it('[ARCH-MAPPING] non-object parser throws propagate with identity', () => {
    const callback = vi.fn();
    const suite = create(
      data => {
        callback(data);
        test('b', () => true);
      },
      enforce.shape({
        a: enforce.architectureThrowPrimitive(),
        b: enforce.isString(),
      }),
    );
    let thrown: unknown;
    try {
      suite.run({ a: 'MAPPED', b: 'ok' });
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toBe('primitive boom');
    expect(callback).not.toHaveBeenCalled();
  });

  it.each(['onlyGroup', 'skipGroup'] as const)(
    '[ARCH-OWNERSHIP] %s already captures group lists consistently',
    kind => {
      const calls = vi.fn();
      const suite = create(() => {
        group('account', () => {
          test('a', () => {
            calls('a');
          });
        });
        group('other', () => {
          test('b', () => {
            calls('b');
          });
        });
      });
      const groups = ['account'];
      const focused = suite.focus({ [kind]: groups });
      groups[0] = 'other';
      focused.run();
      expect(calls.mock.calls).toEqual(
        kind === 'onlyGroup' ? [['a']] : [['b']],
      );
    },
  );

  it.each(['changed', 'only', 'skip'] as const)(
    '[ARCH-OWNERSHIP] %s captures caller-owned field lists at builder creation',
    kind => {
      const calls = vi.fn();
      const suite = create(
        () => {
          mode(Modes.ALL);
          test('a', () => {
            calls('a');
          });
          test('b', () => {
            calls('b');
          });
        },
        enforce.shape({ a: enforce.isString(), b: enforce.isString() }),
      );
      const fields: Array<'a' | 'b'> = ['a'];
      const focused =
        kind === 'changed'
          ? suite.changed(fields)
          : kind === 'only'
            ? suite.only(fields)
            : suite.focus({ skip: fields });
      fields[0] = 'b';
      focused.run({ a: 'ok', b: 'ok' });
      expect(calls.mock.calls).toEqual(kind === 'skip' ? [['b']] : [['a']]);
    },
  );

  it('[ARCH-TRANSACTION] a successor throwing after test creation cannot strand its predecessor', async () => {
    const oldGate = deferred();
    const newGate = deferred();
    const suite = create((data: { version: string }) => {
      test('version', async () => {
        await (data.version === 'old' ? oldGate.promise : newGate.promise);
        enforce(data.version).equals('old');
      });
      if (data.version === 'new')
        throw new Error('setup failed after reconciliation');
    });
    const old = suite.run({ version: 'old' });
    try {
      expect(() => suite.run({ version: 'new' })).toThrow(
        'setup failed after reconciliation',
      );
      oldGate.release();
      newGate.release();
      await flush();
      // A finite event-loop barrier, not a timer-based speed assertion. Both
      // async tests have been released and the reconciler has quiesced.
      const settled = vi.fn();
      void Promise.resolve(old).then(settled);
      await flush();
      expect(settled).toHaveBeenCalledTimes(1);
      expect(settled.mock.calls[0][0].hasErrors('version')).toBe(false);
    } finally {
      oldGate.release();
      newGate.release();
      await flush();
    }
  });

  it.each(['01', '1'])(
    '[ARCH-PATH] numeric record focus establishes exactly key %s',
    key => {
      const schema = enforce.shape({
        dict: enforce.record(enforce.isNumeric().toNumber()),
      });
      const suite = create(() => {
        test('dict', () => true);
      }, schema);
      suite.run({ dict: { '01': '1', '1': '2', other: '3' } });
      const dict = { '01': '1', '1': '2', other: '3', [key]: '9' };
      const result = suite.changed(`dict.${key}`).run({ dict });
      expect(result.value).toEqual({ dict: { [key]: 9 } });
    },
  );
});
