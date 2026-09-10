import { describe, expect, it, vi } from 'vitest';
import { enforce } from 'n4s';

import { create, each, group, mode, Modes, test } from '../../vest';

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
});
