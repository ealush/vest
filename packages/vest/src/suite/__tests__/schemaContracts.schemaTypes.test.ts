import { describe, expect, expectTypeOf, it } from 'vitest';
import { enforce } from 'n4s';

import { create, test } from '../../vest';

// AP06: public type claims. Parser output inference, nested optional
// inference, and the documented non-claim that `$` dependency strings are
// not typo-safe (a misspelled `$` key typechecks but fails at runtime).
describe('schema contracts: public type claims (AP06)', () => {
  it('[SC-AP06] parser output infers the mapped type', () => {
    const schema = enforce.shape({
      n: enforce.isNumeric().toNumber(),
      note: enforce.isString(),
    });
    expectTypeOf(schema.infer).toEqualTypeOf<{
      n: number;
      note: string;
    }>();
    // Runtime honesty: the mapped value really is a number.
    const seen: unknown[] = [];
    const suite = create(data => {
      seen.push(data);
      test('note', () => true);
    }, schema);
    const result = suite.run({ n: '42', note: 'ok' });
    expect(result.isValid()).toBe(true);
    expect(result.value).toEqual({ n: 42, note: 'ok' });
    expect(seen[0]).toEqual({ n: 42, note: 'ok' });
  });

  it('[SC-AP06] nested optional members infer as optional', () => {
    const schema = enforce.shape({
      profile: enforce.optional(
        enforce.shape({
          nick: enforce.isString(),
        }),
      ),
    });
    expectTypeOf(schema.infer).toMatchTypeOf<{
      profile?: unknown;
    }>();
    const suite = create((_data: unknown) => {
      test('profile', () => true);
    }, schema);
    expect(suite.run({}).isValid()).toBe(true);
    expect(suite.run({ profile: { nick: 'ada' } }).isValid()).toBe(true);
  });

  it('[SC-AP06] `$` dependency keys are broad strings, not typo-safe', () => {
    // A misspelled dependency key typechecks (Scope has a string index),
    // so the type system cannot catch the typo. The runtime rejects the
    // dangling reference explicitly instead of silently ignoring it.
    expect(() =>
      enforce.shape({
        a: enforce.isString(),
        b: enforce.isString().dependsOn($ => $.typooo_field),
      }),
    ).toThrow(/unknown field "typooo_field"/);
  });
});
