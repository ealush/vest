import { describe, expect, it } from 'vitest';
import { enforce } from '../../../n4s';
import { omit } from '../omit';

describe('omit', () => {
  it('Should successfully validate a schema ignoring omitted keys', () => {
    const schema = {
      name: enforce.isString(),
      age: enforce.isNumber(),
      email: enforce.isString(), // 'email' not provided, but omitted
    };

    const value = { name: 'John Doe', age: 30 };

    // Omit email, validating valid inputs for name and age
    const result = omit(value, schema, ['email']);
    expect(result.pass).toBe(true);

    // Test failing condition in the non-omitted keys
    const invalidValue = { name: 'John Doe', age: 'thirty' } as any;
    const invalidResult = omit(invalidValue, schema, ['email']);
    expect(invalidResult.pass).toBe(false);
  });

  it('Should handle string param for keysToOmit', () => {
    const schema = {
      id: enforce.isNumber(),
      name: enforce.isString(),
    };

    // omit name
    const value = { id: 1 };
    const result = omit(value, schema, 'name');
    expect(result.pass).toBe(true);

    const invalidResult = omit({ id: 'one' } as any, schema, 'name');
    expect(invalidResult.pass).toBe(false);
  });

  it('Should validate schema even if the payload has extra unspecified keys', () => {
    const schema = {
      id: enforce.isNumber(),
    };

    // 'extra' is not in the schema, but omit validates via loose under the hood
    const value = { id: 1, extra: 'data' };
    // omit nothing
    const result = omit(value, schema, []);
    expect(result.pass).toBe(true);
  });

  it('Should fail immediately and return false if the value is not an object', () => {
    const schema = { name: enforce.isString() };

    expect(omit('string_value' as any, schema, ['name']).pass).toBe(false);
    expect(omit(123 as any, schema, ['name']).pass).toBe(false);
    expect(omit(null as any, schema, ['name']).pass).toBe(false);
  });

  it('Should protect against dangerous prototype keys', () => {
    const schema = { admin: enforce.isBoolean() };

    const dangerousValue = JSON.parse('{"__proto__": {"admin": true}}');
    const result = omit(dangerousValue, schema, ['id']);
    expect(result.pass).toBe(false);
  });

  it('Should gracefully handle schemas that are not objects', () => {
    // e.g. enforcing shape with `omit` but passing a bad schema representation
    const schema = 'not_a_schema' as any;
    const value = { id: 1 };

    // Still passes by checking nothing and defaulting to loose empty schema check
    const result = omit(value, schema, ['id']);
    expect(result.pass).toBe(true);
  });

  it('Should omit everything and accept invalid un-checked properties', () => {
    const schema = { id: enforce.isNumber() };
    const value = { id: 'invalid_type_but_omitted' } as any;

    const result = omit(value, schema, ['id']);
    expect(result.pass).toBe(true);
  });
});

describe('omit - lazy API', () => {
  it('should successfully evaluate enforce.omit() wrapped schema shapes dynamically', () => {
    const defaultSchema = {
      name: enforce.isString(),
      age: enforce.isNumber(),
      email: enforce.isString(),
    };

    const omittedSchema = enforce.omit(defaultSchema, ['email']);

    // Should pass since we dropped the invalid email constraint via omit
    const result = omittedSchema.run({
      name: 'John',
      age: 30,
      // @ts-expect-error - intentionally passing number instead of string
      email: 123,
    });

    expect(result.pass).toBe(true);

    // Should fail because age breaks the remaining shape constraint
    const invalidResult = omittedSchema.run({
      name: 'John',
      // @ts-expect-error - intentionally passing string instead of number
      age: 'thirty',
      // @ts-expect-error - intentionally passing number instead of string
      email: 123,
    });

    expect(invalidResult.pass).toBe(false);
  });
});
