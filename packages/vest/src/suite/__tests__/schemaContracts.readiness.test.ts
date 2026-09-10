import { describe, expect, it, vi } from 'vitest';

import { create, enforce, group, mode, Modes, test } from '../../vest';

function compositionFixture() {
  const calls: string[] = [];
  const schema = enforce.shape({
    a: enforce.isString(),
    b: enforce.isString().dependsOn($ => $.a),
    c: enforce.isString(),
  });
  const suite = create(data => {
    mode(Modes.ALL);
    for (const field of ['a', 'b', 'c'] as const) {
      group(field === 'c' ? 'other' : 'account', () => {
        test(field, () => {
          calls.push(field);
          enforce(data[field]).notEquals('bad');
        });
      });
    }
  }, schema);
  suite.run({ a: 'bad', b: 'bad', c: 'bad' });
  calls.length = 0;
  return { calls, suite };
}

type FixtureSuite = ReturnType<typeof compositionFixture>['suite'];
const compositions = [
  {
    name: 'changed + only',
    select: (s: FixtureSuite) => s.changed('a').only('c'),
    calls: ['a', 'b', 'c'],
    errors: [],
  },
  {
    name: 'only + changed',
    select: (s: FixtureSuite) => s.only('c').changed('a'),
    calls: ['a', 'b', 'c'],
    errors: [],
  },
  {
    name: 'last changed wins',
    select: (s: FixtureSuite) => s.changed('a').changed('c'),
    calls: ['c'],
    errors: ['a', 'b'],
  },
  {
    name: 'last only wins',
    select: (s: FixtureSuite) => s.only('c').only('b'),
    calls: ['b'],
    errors: ['a', 'c'],
  },
  {
    name: 'empty changed',
    select: (s: FixtureSuite) => s.changed([]),
    calls: [],
    errors: ['a', 'b', 'c'],
  },
  {
    name: 'only + empty changed',
    select: (s: FixtureSuite) => s.only('b').changed([]),
    calls: ['b'],
    errors: ['a', 'c'],
  },
  {
    name: 'empty changed + only',
    select: (s: FixtureSuite) => s.changed([]).only('b'),
    calls: ['b'],
    errors: ['a', 'c'],
  },
  {
    name: 'undefined clears changed, keeps only',
    select: (s: FixtureSuite) => s.only('c').changed('a').changed(undefined),
    calls: ['c'],
    errors: ['a', 'b'],
  },
  {
    name: 'undefined clears only, keeps changed',
    select: (s: FixtureSuite) => s.changed('a').only('c').only(undefined),
    calls: ['a', 'b'],
    errors: ['c'],
  },
  {
    name: 'skip source after expansion',
    select: (s: FixtureSuite) => s.changed('a').focus({ skip: 'a' }),
    calls: ['b'],
    errors: ['c'],
  },
  {
    name: 'skip source before expansion',
    select: (s: FixtureSuite) => s.focus({ skip: 'a' }).changed('a'),
    calls: ['b'],
    errors: ['c'],
  },
  {
    name: 'onlyGroup intersects changed',
    select: (s: FixtureSuite) =>
      s.changed(['a', 'c']).focus({ onlyGroup: 'account' }),
    calls: ['a', 'b'],
    errors: ['c'],
  },
  {
    name: 'skipGroup retains excluded history (existing runtime contract)',
    select: (s: FixtureSuite) =>
      s.changed(['a', 'c']).focus({ skipGroup: 'account' }),
    calls: ['c'],
    errors: ['a', 'b'],
  },
];

describe('schema contracts: release-readiness suite audit', () => {
  it.each(compositions)(
    '[SC-COMPOSITION] $name',
    ({ select, calls, errors }) => {
      const fixture = compositionFixture();
      const result = select(fixture.suite).run({ a: 'ok', b: 'ok', c: 'ok' });
      expect(fixture.calls).toEqual(calls);
      expect(
        (['a', 'b', 'c'] as const).filter(field => result.hasErrors(field)),
      ).toEqual(errors);
    },
  );

  it.each([false, true])(
    '[SC-SKIP-PRECEDENCE] an explicit field skip wins over only with schema=%s',
    withSchema => {
      const calls = vi.fn(() => true);
      const suite = create(
        () => {
          test('a', calls);
        },
        withSchema ? enforce.shape({ a: enforce.isString() }) : undefined,
      );
      suite.focus({ only: 'a', skip: 'a' }).run({ a: 'ok' });
      expect(calls).not.toHaveBeenCalled();
    },
  );

  // Exercise the public ownership boundary rather than just cloneDataTree(true).
  it.each(['callback', 'result'] as const)(
    '[SC-ACCESSOR-INTEGRATION] %s getter results cannot alias caller-owned data',
    boundary => {
      const live = { value: 1 };
      const payload = {
        get nested() {
          return live;
        },
      };
      let callbackData: typeof payload | undefined;
      const suite = create(
        data => {
          callbackData = data.payload;
          test('payload', () => true);
        },
        enforce.shape({
          payload: enforce.condition((value: typeof payload) => value !== null),
        }),
      );
      const result = suite.run({ payload });
      const output =
        boundary === 'callback' ? callbackData : result.value?.payload;
      expect(output).toBeDefined();
      expect((output as typeof payload).nested).not.toBe(live);
      (output as typeof payload).nested.value = 9;
      expect(live.value).toBe(1);
    },
  );

  it.each(['callback', 'result'] as const)(
    '[SC-ACCESSOR-INTEGRATION] %s writes cannot invoke caller-owned setters',
    boundary => {
      const setter = vi.fn();
      const payload = Object.defineProperty({}, 'secret', {
        set: setter,
        enumerable: true,
      });
      let callbackData: object | undefined;
      const suite = create(
        data => {
          callbackData = data.payload;
          test('payload', () => true);
        },
        enforce.shape({
          payload: enforce.condition((value: object) => value !== null),
        }),
      );
      const result = suite.run({ payload });
      const output =
        boundary === 'callback' ? callbackData : result.value?.payload;
      expect(output).toBeDefined();
      // An immutable detached output may reject writes; it must never call
      // the original setter, regardless of the chosen local write policy.
      try {
        Reflect.set(output as object, 'secret', 'new');
      } catch {
        /* read-only is allowed */
      }
      expect(setter).not.toHaveBeenCalled();
    },
  );
});
