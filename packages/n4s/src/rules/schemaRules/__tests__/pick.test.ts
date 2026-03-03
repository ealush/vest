import { describe, expect, it } from 'vitest';
import { enforce } from '../../../n4s';
import { pick } from '../pick';

describe('pick', () => {
  it('Should successfully validate the picked subset of a schema', () => {
    const schema = {
      name: enforce.isString(),
      age: enforce.isNumber(),
      email: enforce.isString(),
    };

    const value = { name: 'John Doe', age: 30 };

    // Pick name and age, validating valid inputs
    const result = pick(value, schema, ['name', 'age']);
    expect(result.pass).toBe(true);

    // Test failing condition in the picked keys
    const invalidValue = { name: 'John Doe', age: 'thirty' };
    const invalidResult = pick(invalidValue, schema, ['name', 'age']);
    expect(invalidResult.pass).toBe(false);
  });

  it('Should handle string param for keysToPick', () => {
    const schema = {
      id: enforce.isNumber(),
      name: enforce.isString(),
    };

    const value = { id: 1 };
    const result = pick(value, schema, 'id');
    expect(result.pass).toBe(true);

    const invalidResult = pick({ id: 'one' }, schema, 'id');
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
    const value = { name: 'John Doe', age: 30 };
    const result = pick(value, schema, ['name', 'age']);
    expect(result.pass).toBe(true);
  });

  it('Should validate schema even if the payload has extra unspecified keys', () => {
    const schema = {
      id: enforce.isNumber(),
    };

    // 'extra' is not in the schema, but pick validates via loose under the hood
    const value = { id: 1, extra: 'data' };
    const result = pick(value, schema, ['id']);
    expect(result.pass).toBe(true);
  });

  it('Should fail immediately and return false if the value is not an object', () => {
    const schema = { name: enforce.isString() };

    expect(pick('string_value' as any, schema, ['name']).pass).toBe(false);
    expect(pick(123 as any, schema, ['name']).pass).toBe(false);
    expect(pick(null as any, schema, ['name']).pass).toBe(false);
  });

  it('Should protect against dangerous prototype keys', () => {
    const schema = { admin: enforce.isBoolean() };

    const dangerousValue = JSON.parse('{"__proto__": {"admin": true}}');
    const result = pick(dangerousValue, schema, ['admin']);
    expect(result.pass).toBe(false);
  });

  it('Should gracefully handle schemas that are not objects', () => {
    // e.g. enforcing shape with `pick` but passing a bad schema representation
    const schema = 'not_a_schema' as any;
    const value = { id: 1 };

    // Still passes by checking nothing and defaulting to loose empty schema check
    const result = pick(value, schema, ['id']);
    expect(result.pass).toBe(true);
  });

  it('Should work with empty pick list', () => {
    const schema = { id: enforce.isNumber() };
    const value = { id: 'invalid_type_but_not_checked' };

    const result = pick(value, schema, []);
    expect(result.pass).toBe(true);
  });
});

describe('pick - lazy API', () => {
  it('should successfully evaluate enforce.pick() wrapped schema shapes dynamically', () => {
    const defaultSchema = {
      name: enforce.isString(),
      age: enforce.isNumber(),
      email: enforce.isString(),
    };

    const pickedSchema = enforce.pick(defaultSchema, ['name', 'age']);

    // Should pass since we dropped the invalid email constraint
    // @ts-expect-error - Expected 2 arguments but got 1
    const result = pickedSchema.run({
      name: 'John',
      age: 30,
      email: 123,
    });

    expect(result.pass).toBe(true);

    // Should fail because age breaks the explicitly picked constraint
    // @ts-expect-error - Expected 2 arguments but got 1
    const invalidResult = pickedSchema.run({
      name: 'John',
      age: 'thirty',
      email: 123,
    });

    expect(invalidResult.pass).toBe(false);
  });
});
