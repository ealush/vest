import { describe, expect, it } from 'vitest';
import { enforce } from '../../../n4s';

describe('pick', () => {
  it('Should successfully validate the picked subset of a schema', () => {
    const schema = {
      name: enforce.isString(),
      age: enforce.isNumber(),
      email: enforce.isString(),
    };

    const pickedSchema = enforce.pick(schema, ['name', 'age']);

    // Pick name and age, validating valid inputs
    const result = pickedSchema.run({ name: 'John Doe', age: 30 });
    expect(result.pass).toBe(true);

    // Test failing condition in the picked keys
    const invalidResult = pickedSchema.run({
      name: 'John Doe',
      // @ts-expect-error - intentionally passing string instead of number
      age: 'thirty',
    });
    expect(invalidResult.pass).toBe(false);
  });

  it('Should handle string param for keysToPick', () => {
    const schema = {
      id: enforce.isNumber(),
      name: enforce.isString(),
    };

    const pickedSchema = enforce.pick(schema, 'id');

    const result = pickedSchema.run({ id: 1 });
    expect(result.pass).toBe(true);

    const invalidResult = pickedSchema.run({
      // @ts-expect-error - intentionally passing string instead of number
      id: 'one',
    });
    expect(invalidResult.pass).toBe(false);
  });

  it('Should not fail validation for missing un-picked keys', () => {
    const schema = {
      name: enforce.isString(),
      age: enforce.isNumber(),
      email: enforce.isString(),
    };

    // 'email' is in the schema but missing in the value.
    // If we only pick 'name' and 'age', it should still pass.
    const pickedSchema = enforce.pick(schema, ['name', 'age']);
    const result = pickedSchema.run({ name: 'John Doe', age: 30 });
    expect(result.pass).toBe(true);
  });

  it('Should validate schema even if the payload has extra unspecified keys', () => {
    const schema = {
      id: enforce.isNumber(),
    };

    // 'extra' is not in the schema, but pick validates via loose under the hood
    const pickedSchema = enforce.pick(schema, ['id']);
    // @ts-expect-error - extra keys not in schema
    const result = pickedSchema.run({ id: 1, extra: 'data' });
    expect(result.pass).toBe(true);
  });

  it('Should fail immediately and return false if the value is not an object', () => {
    const schema = { name: enforce.isString() };
    const pickedSchema = enforce.pick(schema, ['name']);

    // @ts-expect-error - testing non-object value
    expect(pickedSchema.run('string_value').pass).toBe(false);
    // @ts-expect-error - testing non-object value
    expect(pickedSchema.run(123).pass).toBe(false);
    // @ts-expect-error - testing non-object value
    expect(pickedSchema.run(null).pass).toBe(false);
  });

  it('Should protect against dangerous prototype keys', () => {
    const schema = { admin: enforce.isBoolean() };
    const pickedSchema = enforce.pick(schema, ['admin']);

    const dangerousValue = JSON.parse('{"__proto__": {"admin": true}}');
    const result = pickedSchema.run(dangerousValue);
    expect(result.pass).toBe(false);
  });

  it('Should fail when schema is not an object', () => {
    const schema = 'not_a_schema';
    // @ts-expect-error - testing non-object schema
    const pickedSchema = enforce.pick(schema, ['id']);

    const result = pickedSchema.run({ id: 1 });
    expect(result.pass).toBe(false);
  });

  it('Should work with empty pick list', () => {
    const schema = { id: enforce.isNumber() };
    const pickedSchema = enforce.pick(schema, []);

    const result = pickedSchema.run({
      id: 'invalid_type_but_not_checked',
    });
    expect(result.pass).toBe(true);
  });

  it('Should pass with valid picked fields and ignore invalid un-picked fields', () => {
    const schema = {
      name: enforce.isString(),
      age: enforce.isNumber(),
      email: enforce.isString(),
    };

    const pickedSchema = enforce.pick(schema, ['name', 'age']);

    // Should pass since we dropped the invalid email constraint
    const result = pickedSchema.run({
      name: 'John',
      age: 30,
      // @ts-expect-error - intentionally passing number instead of string
      email: 123,
    });

    expect(result.pass).toBe(true);

    // Should fail because age breaks the explicitly picked constraint
    const invalidResult = pickedSchema.run({
      name: 'John',
      // @ts-expect-error - intentionally passing string instead of number
      age: 'thirty',
      email: 123,
    });

    expect(invalidResult.pass).toBe(false);
  });

  it('drops rooted edges whose provider was picked away', () => {
    const schema = {
      accountType: enforce.isString(),
      child: enforce.isString().dependsOn($ => $.root.accountType),
    };

    const pickedSchema = enforce.pick(schema, ['child']);

    // The focused projection stays self-contained: no dangling provider,
    // so the run-time rooted boundary accepts it.
    expect(pickedSchema.describe().relationships).toEqual([]);
    expect(pickedSchema.test({ child: 'x' })).toBe(true);
  });
});
