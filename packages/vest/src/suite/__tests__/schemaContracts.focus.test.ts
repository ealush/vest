import { describe, expect, it, vi } from 'vitest';
import { enforce } from 'n4s';

import {
  create,
  each,
  group,
  include,
  mode,
  Modes,
  omitWhen,
  optional,
  skipWhen,
  test,
} from '../../vest';
import { memo } from '../../exports/memo';

// Dynamic field names and schemaless suites cannot satisfy create()'s
// literal overloads; the contracts under test are runtime behavior.

type LooseSuite = any;

const containers = ['shape', 'loose', 'partial'] as const;
const inclusions = ['only', 'focus', 'changed', 'combined-empty'] as const;
const cases = containers.flatMap(container =>
  inclusions.map(inclusion => ({ container, inclusion })),
);

function fixture(container: (typeof containers)[number]) {
  const a = vi.fn((value: unknown) => value !== 'bad');
  const b = vi.fn(() => true);
  const schema = enforce[container]({
    a: enforce.condition(a),
    b: enforce.condition(b),
  });
  const suite = create(() => {
    mode(Modes.ALL);
    each(['a', 'b'], field => {
      test(field, () => true, field);
    });
  }, schema);
  return { a, b, schema, suite };
}

describe('schema contracts: focus and temporal state', () => {
  it.each(cases)(
    '[SC-RETAIN] $container/$inclusion retains untouched schema errors without rerunning their predicate',
    ({ container, inclusion }) => {
      const { suite, a, b } = fixture(container);
      expect(suite.run({ a: 'bad', b: 'old' }).hasErrors('a')).toBe(true);
      a.mockClear();
      b.mockClear();
      const focused =
        inclusion === 'only'
          ? suite.only('b')
          : inclusion === 'focus'
            ? suite.focus({ only: 'b' })
            : inclusion === 'changed'
              ? suite.changed('b')
              : suite.only('b').changed([]);
      const result = focused.run({ a: 'bad', b: 'new' });
      expect(result.hasErrors('a')).toBe(true);
      expect(result.isValid()).toBe(false);
      expect(result.value).toBeUndefined();
      expect(a).not.toHaveBeenCalled();
      expect(b).toHaveBeenCalledTimes(1);
      expect(
        suite.changed('a').run({ a: 'good', b: 'new' }).hasErrors('a'),
      ).toBe(false);
    },
  );

  it.each(['resetField', 'remove', 'reset', 'resume'] as const)(
    '[SC-LIFECYCLE] %s is authoritative for schema history',
    operation => {
      const { suite, schema } = fixture('shape');
      suite.run({ a: 'bad', b: 'ok' });
      if (operation === 'resume') {
        const resumed = create(() => {
          mode(Modes.ALL);
          each(['a', 'b'], field => {
            test(field, () => true, field);
          });
        }, schema);
        resumed.resume(suite.dump());
        expect(
          resumed.only('b').run({ a: 'bad', b: 'ok' }).hasErrors('a'),
        ).toBe(true);
        return;
      }
      if (operation === 'reset') suite.reset();
      else suite[operation]('a');
      expect(suite.changed('b').run({ a: 'bad', b: 'ok' }).hasErrors('a')).toBe(
        false,
      );
    },
  );

  it('[SC-EMPTY] zero-field changed runs no schema predicates and retains history', () => {
    const { suite, a, b } = fixture('shape');
    suite.run({ a: 'bad', b: 'ok' });
    a.mockClear();
    b.mockClear();
    expect(suite.changed([]).run({ a: 'good', b: 'new' }).hasErrors('a')).toBe(
      true,
    );
    expect(a).not.toHaveBeenCalled();
    expect(b).not.toHaveBeenCalled();
  });

  it('[SC-SKIP] explicit skip destroys a prior field failure without evaluating its predicate', () => {
    const { suite, a } = fixture('shape');
    suite.run({ a: 'bad', b: 'ok' });
    a.mockClear();
    expect(
      suite
        .changed('a')
        .focus({ skip: 'a' })
        .run({ a: 'bad', b: 'ok' })
        .hasErrors('a'),
    ).toBe(false);
    expect(a).not.toHaveBeenCalled();
  });

  it.each([
    ['good', 'bad', true],
    ['bad', 'good', false],
  ] as const)(
    '[SC-SUBTREE] parent edit refreshes child verdict %s -> %s',
    (before, after, hasError) => {
      const called = vi.fn((value: string) => value === 'good');
      const schema = enforce.shape({
        p: enforce.shape({ a: enforce.isString() }),
        phone: enforce.isString(),
      });
      const unrelated = vi.fn(() => true);
      const suite = create(data => {
        mode(Modes.ALL);
        test('p.a', () => called(data.p.a));
        test('phone', unrelated);
      }, schema);
      suite.run({ p: { a: before }, phone: 'ok' });
      called.mockClear();
      unrelated.mockClear();
      const result = suite.changed('p').run({ p: { a: after }, phone: 'ok' });
      expect(called).toHaveBeenCalledExactlyOnceWith(after);
      expect(unrelated).not.toHaveBeenCalled();
      expect(result.hasErrors('p.a')).toBe(hasError);
    },
  );

  it('[SC-SUBTREE] newly declared child tests are selected on a parent edit', () => {
    const child = vi.fn(() => false);
    const suite = create(
      (data: { enabled: boolean; p: { a: string } }) => {
        test('enabled', () => true);
        each(data.enabled ? ['p.a'] : [], field => {
          test(field, child, field);
        });
      },
      enforce.shape({
        enabled: enforce.isBoolean(),
        p: enforce.shape({ a: enforce.isString() }),
      }),
    );
    suite.run({ enabled: false, p: { a: 'ok' } });
    const result = suite.changed('p').run({ enabled: true, p: { a: 'bad' } });
    expect(child).toHaveBeenCalledTimes(1);
    expect(result.hasErrors('p.a')).toBe(true);
  });

  it('[SC-STATIC] static execution discards state and cannot resurrect old schema failures', () => {
    const { suite } = fixture('shape');
    suite.run({ a: 'bad', b: 'ok' });
    expect(suite.runStatic({ a: 'good', b: 'ok' }).hasErrors()).toBe(false);
    expect(suite.get().hasErrors()).toBe(false);
    expect(suite.changed('b').run({ a: 'bad', b: 'ok' }).hasErrors('a')).toBe(
      false,
    );
  });

  it('[SC-GROUP] group focus excludes top-level schema issues while grouped user tests still run', () => {
    const called = vi.fn(() => false);
    const suite = create(
      () => {
        group('account', () => {
          test('a', 'business failure', called);
        });
      },
      enforce.shape({ a: enforce.isString().isNotBlank() }),
    );
    const result = suite
      .changed('a')
      .focus({ onlyGroup: 'account' })
      .run({ a: '' });
    expect(called).toHaveBeenCalledTimes(1);
    expect(result.getErrors('a')).toEqual(['business failure']);
  });

  it('[SC-MODIFIER] include rescues a test from changed-focus exclusion', () => {
    const calls: string[] = [];
    const suite: LooseSuite = create(() => {
      mode(Modes.ALL);
      include('b').when(() => true);
      test('a', () => {
        calls.push('a');
      });
      test('b', () => {
        calls.push('b');
      });
    });
    suite.changed('a').run({});
    expect(calls.sort()).toEqual(['a', 'b']);
  });

  it('[SC-MODIFIER] skipWhen hides the dependent user test but not its schema predicate', () => {
    const schemaPredicate = vi.fn(() => true);
    const userTest = vi.fn(() => true);
    const suite = create(
      () => {
        mode(Modes.ALL);
        skipWhen(true, () => {
          test('b', userTest);
        });
        test('a', () => true);
      },
      enforce.shape({
        a: enforce.isString(),
        b: enforce.condition(schemaPredicate).dependsOn($ => $.a),
      }),
    );
    const result = suite.changed('a').run({ a: 'ok', b: 'ok' });
    expect(schemaPredicate).toHaveBeenCalledTimes(1);
    expect(userTest).not.toHaveBeenCalled();
    expect(result.hasErrors('b')).toBe(false);
  });

  it('[SC-MODIFIER] omitWhen removes its test from changed runs entirely', () => {
    const omitted = vi.fn(() => true);
    const suite: LooseSuite = create(() => {
      mode(Modes.ALL);
      omitWhen(true, () => {
        test('gone', omitted);
      });
      test('a', () => true);
    });
    const result = suite.changed('a').run({});
    expect(omitted).not.toHaveBeenCalled();
    expect(result.tests.gone).toBeUndefined();
    expect(result.hasErrors('gone')).toBe(false);
  });

  it('[SC-MODIFIER] absent optional fields do not break changed runs', () => {
    const suite: LooseSuite = create(() => {
      mode(Modes.ALL);
      test('a', () => true);
      optional('c');
    });
    const result = suite.changed('a').run({});
    expect(result.hasErrors('a')).toBe(false);
    expect(result.hasErrors('c')).toBe(false);
  });

  it('[SC-MODIFIER] duplicate field names across groups all run on change', () => {
    const first = vi.fn(() => true);
    const second = vi.fn(() => true);
    const suite: LooseSuite = create(() => {
      mode(Modes.ALL);
      group('one', () => {
        test('shared', first);
      });
      group('two', () => {
        test('shared', second);
      });
    });
    const result = suite.changed('shared').run({});
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
    expect(result.groups.one.shared.testCount).toBe(1);
    expect(result.groups.two.shared.testCount).toBe(1);
  });

  it('[SC-MODE] ONE mode stops a changed run at the first failure', () => {
    const first = vi.fn(() => false);
    const second = vi.fn(() => false);
    const suite: LooseSuite = create(() => {
      mode(Modes.ONE);
      test('a', first);
      test('b', second);
    });
    suite.changed(['a', 'b']).run({});
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).not.toHaveBeenCalled();
  });

  it('[SC-MEMO] memoized tests do not rerun across unchanged changed-runs', () => {
    const cb = vi.fn(() => true);
    const suite: LooseSuite = create(() => {
      mode(Modes.ALL);
      memo(() => {
        test('stable', cb);
      }, ['key']);
    });
    suite.changed('stable').run({});
    suite.changed('stable').run({});
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('[SC-PATH] unknown changed paths run nothing and report no errors', () => {
    const called = vi.fn(() => true);
    const suite: LooseSuite = create(() => {
      mode(Modes.ALL);
      test('a', called);
    });
    const result = suite.changed('nope.missing').run({});
    expect(called).not.toHaveBeenCalled();
    expect(result.hasErrors()).toBe(false);
  });

  it('[SC-PATH] empty changed paths are a no-op full run', () => {
    const calls: string[] = [];
    const suite: LooseSuite = create(() => {
      mode(Modes.ALL);
      test('a', () => {
        calls.push('a');
      });
      test('b', () => {
        calls.push('b');
      });
    });
    // Falsy scalars clear changed focus: the run is unrestricted.
    suite.changed(undefined).run({});
    expect(calls.sort()).toEqual(['a', 'b']);
  });

  it('[SC-PATH] bracket and dot spellings select the same nested field', () => {
    const dot = vi.fn(() => true);
    const bracket = vi.fn(() => true);
    const schema = enforce.shape({
      rows: enforce.isArrayOf(enforce.isString()),
    });
    const dotSuite = create(() => {
      test('rows.0', dot);
    }, schema);
    const bracketSuite = create(() => {
      test('rows.0', bracket);
    }, schema);
    dotSuite.changed('rows.0').run({ rows: ['x'] });
    bracketSuite.changed('rows[0]').run({ rows: ['x'] });
    expect(dot).toHaveBeenCalledTimes(1);
    expect(bracket).toHaveBeenCalledTimes(1);
  });
});
