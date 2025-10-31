import { describe, expect, it } from 'vitest';

import { enforceLazy } from '../lazy';

import { allOf, anyOf, isArrayOf, loose, optional, shape } from 'schemaRules';

describe('integration: rules with schema combinators', () => {
  it('shape: combine isString with notBlank and length', () => {
    const userSchema = shape({
      name: allOf(
        enforceLazy.isString(),
        enforceLazy.isString().isNotBlank(),
        enforceLazy.isString().minLength(2),
      ),
      tags: enforceLazy.isArray<string>().isNotEmpty(),
    });

    expect(userSchema.run({ name: 'Alice', tags: ['dev'] }).passes).toBe(true);
    expect(userSchema.run({ name: ' ', tags: ['dev'] }).passes).toBe(false);
    expect(userSchema.run({ name: 'A', tags: ['dev'] }).passes).toBe(false);
    // extra field should fail shape
    expect(
      userSchema.run({ name: 'Alice', tags: ['dev'], extra: 1 } as any).passes,
    ).toBe(false);
  });

  it('optional + nullish with numbers', () => {
    const schema = shape({
      id: enforceLazy.isNumber().greaterThan(0),
      deletedAt: optional(enforceLazy.isNullish()),
    });

    expect(schema.run({ id: 1 }).passes).toBe(true);
    expect(schema.run({ id: 1, deletedAt: null }).passes).toBe(true);
    // non-nullish value fails optional(isNullish())
    expect(schema.run({ id: 1, deletedAt: 'now' as any }).passes).toBe(false);
  });

  it('isArrayOf with numeric acceptance (numbers or numeric strings)', () => {
    const arrRule = isArrayOf(enforceLazy.isNumeric(), enforceLazy.isNumber());
    expect(arrRule.run([1, '2', 3]).passes).toBe(true);
    expect(arrRule.run([1, 'two']).passes).toBe(false);
  });

  it('anyOf mixing negative and positive rules', () => {
    // accept values that are not numeric, or numeric >= 10
    const rule = anyOf(
      enforceLazy.isNotNumeric(),
      // numbers only chain
      enforceLazy.isNumeric().greaterThanOrEquals(10),
    );

    expect(rule.run('abc').passes).toBe(true); // not numeric
    expect(rule.run('9').passes).toBe(false);
    expect(rule.run('10').passes).toBe(true);
  });

  it('checkKey / checkValue inside shape fields', () => {
    const ENV = { dev: 1, prod: 2 } as const;

    const schema = loose({
      envKey: enforceLazy.checkKey().isKeyOf(ENV),
      envValue: enforceLazy
        .checkValue<number>()
        .isValueOf({ a: 1, b: 2, c: 3 }),
    });

    expect(schema.run({ envKey: 'dev', envValue: 2 }).passes).toBe(true);
    expect(schema.run({ envKey: 'stage', envValue: 4 }).passes).toBe(false);
  });
});
