import { describe, expect, it, vi } from 'vitest';
import { EnforceSchemaError, enforce } from 'n4s';
import { mapWithoutValidation } from 'n4s/exports/internal';

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
enforce.extend(
  {
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
  },
  {
    parsers: [
      'architectureNumber',
      'architectureBox',
      'architectureBoom',
      'architectureConditionalMapped',
      'architectureBoomOnMapped',
      'architectureFrameworkBoom',
      'architectureUserEnforceBoom',
      'architectureThrowPrimitive',
    ],
  },
);

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
  it('[ARCH-MAPPING] parser-only mapping continues after a parser validation failure', () => {
    // Both parser transforms are total and return the declared type. The
    // first verdict must not short-circuit a pass that explicitly ignores it.
    expect(
      mapWithoutValidation(mappingSchema(), { a: 'raw', b: 'ok' }),
    ).toEqual({ a: { value: 2 }, b: 'ok' });
  });

  it('[ARCH-MAPPING] a fresh focused callback receives the final parser type on untouched fields', () => {
    const seen = vi.fn();
    const suite = create(data => {
      seen(data.a);
      test('b', () => true);
    }, mappingSchema());
    const result = suite.changed('b').run({ a: 'raw', b: 'ok' });
    expect(result.isValid()).toBe(true);
    expect(seen).toHaveBeenCalledExactlyOnceWith({ value: 2 });
    expect(result.value).toEqual({ a: { value: 2 }, b: 'ok' });
  });

  it('[ARCH-UNION] an opaque untouched union fails explicitly before calling a typed callback', () => {
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
    // There is no prior branch witness, and choosing the first branch
    // requires an opaque predicate. Never claim a complete typed mapping.
    expect(() => suite.changed('b').run({ a: [2], b: 'ok' })).toThrow(
      /mapping|focused|union/i,
    );
    expect(callback).not.toHaveBeenCalled();
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

  it('[ARCH-MAPPING] throwing parser preserves cause without a second validation route', () => {
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

    let thrown: unknown;
    try {
      suite.changed('b').focus({ skip: 'a' }).run({ a: 'x', b: 'y' });
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBe(architectureBoomError);
    expect(selected).toHaveBeenCalledTimes(1);
    expect(callback).not.toHaveBeenCalled();
  });

  it('[ARCH-MAPPING] failure mapping propagates parser exceptions instead of raw fallback', () => {
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
    expect(callback).toHaveBeenCalledTimes(1);

    // Validation fails at the first stage (short-circuit: the throwing
    // stage never runs as a validator). Failure mapping runs every parser
    // stage, so the second stage throws there.
    let thrown: unknown;
    try {
      suite.run({ a: 'bad', b: 'ok' });
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toBe(architectureMappedBoomError);
    // No callback with fabricated raw input, no partial publication, and
    // the previously delivered snapshot is untouched.
    expect(callback).toHaveBeenCalledTimes(1);
    expect(delivered).toEqual({ a: 'good', b: 'ok' });
    expect(suite.get().hasErrors()).toBe(false);

    const recovery = suite.run({ a: 'fine', b: 'ok' });
    expect(recovery.isValid()).toBe(true);
    expect(recovery.value).toEqual({ a: 'fine', b: 'ok' });
  });

  it('[ARCH-MAPPING] mapping-stage faults propagate instead of raw fallback', () => {
    const callback = vi.fn();
    const suite = create(
      data => {
        callback(data);
        test('b', () => true);
      },
      enforce.shape({
        a: enforce.architectureConditionalMapped().architectureFrameworkBoom(),
        b: enforce.isString(),
      }),
    );
    const valid = suite.run({ a: 'good', b: 'ok' });
    expect(valid.isValid()).toBe(true);
    // Validation fails at the first stage; failure mapping reaches the
    // second stage, which throws. There is no framework-owned fallback:
    // the fault propagates by identity with no fabricated callback input.
    let thrown: unknown;
    try {
      suite.run({ a: 'bad', b: 'ok' });
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toBeInstanceOf(Error);
    expect((thrown as Error).message).toBe('structural mapping fault');
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('[ARCH-MAPPING] user-thrown EnforceSchemaError propagates instead of raw fallback', () => {
    const callback = vi.fn();
    const userFault = new EnforceSchemaError('user parser fault');
    const suite = create(
      data => {
        callback(data);
        test('b', () => true);
      },
      enforce.shape({
        a: enforce
          .architectureConditionalMapped()
          .architectureUserEnforceBoom(),
        b: enforce.isString(),
      }),
    );
    const valid = suite.run({ a: 'good', b: 'ok' });
    expect(valid.isValid()).toBe(true);
    // Validation fails at the first stage; failure mapping reaches the
    // second stage, which throws the public EnforceSchemaError. The
    // dedicated-error boundary must NOT swallow it as mapping-unavailable.
    let thrown: unknown;
    try {
      suite.run({ a: 'bad', b: 'ok' });
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toBeInstanceOf(EnforceSchemaError);
    expect((thrown as Error).message).toBe('user parser fault');
    expect(thrown).not.toBe(userFault);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('[ARCH-MAPPING] non-object mapping throws propagate with identity', () => {
    const callback = vi.fn();
    const suite = create(
      data => {
        callback(data);
        test('b', () => true);
      },
      enforce.shape({
        a: enforce.architectureConditionalMapped().architectureThrowPrimitive(),
        b: enforce.isString(),
      }),
    );
    let thrown: unknown;
    try {
      suite.run({ a: 'bad', b: 'ok' });
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
    '[ARCH-PATH] numeric record focus preserves complete mapped callback data at key %s',
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
      expect(result.value).toEqual({
        dict: { '01': 1, '1': 2, other: 3, [key]: 9 },
      });
    },
  );
});
