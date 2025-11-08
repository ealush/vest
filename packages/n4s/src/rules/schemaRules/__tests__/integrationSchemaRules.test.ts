import { describe, expect, it } from 'vitest';

import { enforce } from 'n4s';

describe('integration: rules with schema combinators', () => {
  it('shape: combine isString with notBlank and length', () => {
    const userSchema = enforce.shape({
      name: enforce.allOf(
        enforce.isString(),
        enforce.isString().isNotBlank(),
        enforce.isString().minLength(2),
      ),
      tags: enforce.isArray<string>().isNotEmpty(),
    });

    expect(userSchema.run({ name: 'Alice', tags: ['dev'] }).pass).toBe(true);
    expect(userSchema.run({ name: ' ', tags: ['dev'] }).pass).toBe(false);
    expect(userSchema.run({ name: 'A', tags: ['dev'] }).pass).toBe(false);
    // extra field should fail shape
    expect(
      userSchema.run({ name: 'Alice', tags: ['dev'], extra: 1 } as any).pass,
    ).toBe(false);
  });

  it('optional + nullish with numbers', () => {
    const schema = enforce.shape({
      id: enforce.isNumber().greaterThan(0),
      deletedAt: enforce.optional(enforce.isNullish()),
    });

    expect(schema.run({ id: 1 }).pass).toBe(true);
    expect(schema.run({ id: 1, deletedAt: null }).pass).toBe(true);
    // non-nullish value fails optional(isNullish())
    expect(schema.run({ id: 1, deletedAt: 'now' as any }).pass).toBe(false);
  });

  it('isArrayOf with numeric acceptance (numbers or numeric strings)', () => {
    const arrRule = enforce.isArrayOf(enforce.isNumeric(), enforce.isNumber());
    expect(arrRule.run([1, '2', 3]).pass).toBe(true);
    expect(arrRule.run([1, 'two']).pass).toBe(false);
  });

  it('anyOf mixing negative and positive rules', () => {
    // accept values that are not numeric, or numeric >= 10
    const rule = enforce.anyOf(
      enforce.isNotNumeric(),
      // numbers only chain
      enforce.isNumeric().greaterThanOrEquals(10),
    );

    expect(rule.run('abc').pass).toBe(true); // not numeric
    expect(rule.run('9').pass).toBe(false);
    expect(rule.run('10').pass).toBe(true);
  });

  it('checkKey / checkValue inside shape fields', () => {
    const ENV = { dev: 1, prod: 2 } as const;

    const schema = enforce.loose({
      envKey: enforce.isKeyOf(ENV),
      envValue: enforce.isValueOf({ a: 1, b: 2, c: 3 }),
    });

    expect(schema.run({ envKey: 'dev', envValue: 2 } as any).pass).toBe(true);
    expect(schema.run({ envKey: 'stage', envValue: 4 } as any).pass).toBe(
      false,
    );
  });
});
