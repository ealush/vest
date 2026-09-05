import { describe, expect, it } from 'vitest';
import { enforce } from '../../../n4s';

describe('omit', () => {
  it('rejects unknown keys at compile time', () => {
    const schema = {
      name: enforce.isString(),
    };

    // @ts-expect-error - 'typo' is not a schema key
    void enforce.omit(schema, ['typo']);
  });

  it('Should successfully validate a schema ignoring omitted keys', () => {
    const schema = {
      name: enforce.isString(),
      age: enforce.isNumber(),
      email: enforce.isString(),
    };

    const omittedSchema = enforce.omit(schema, ['email']);

    // Omit email, validating valid inputs for name and age
    const result = omittedSchema.run({ name: 'John Doe', age: 30 });
    expect(result.pass).toBe(true);

    // Test failing condition in the non-omitted keys
    const invalidResult = omittedSchema.run({
      name: 'John Doe',
      // @ts-expect-error - intentionally passing string instead of number
      age: 'thirty',
    });
    expect(invalidResult.pass).toBe(false);
  });

  it('Should handle string param for keysToOmit', () => {
    const schema = {
      id: enforce.isNumber(),
      name: enforce.isString(),
    };

    // omit name
    const omittedSchema = enforce.omit(schema, 'name');

    const result = omittedSchema.run({ id: 1 });
    expect(result.pass).toBe(true);

    const invalidResult = omittedSchema.run({
      // @ts-expect-error - intentionally passing string instead of number
      id: 'one',
    });
    expect(invalidResult.pass).toBe(false);
  });

  it('Should validate schema even if the payload has extra unspecified keys', () => {
    const schema = {
      id: enforce.isNumber(),
    };

    // omit nothing
    const omittedSchema = enforce.omit(schema, []);
    // @ts-expect-error - extra keys not in schema
    const result = omittedSchema.run({ id: 1, extra: 'data' });
    expect(result.pass).toBe(true);
  });

  it('Should fail immediately and return false if the value is not an object', () => {
    const schema = { name: enforce.isString() };
    const omittedSchema = enforce.omit(schema, ['name']);

    // Note: the fully-omitted schema type is `{}` so non-null payloads
    // typecheck here; the runtime still rejects them (asserted below).
    expect(omittedSchema.run('string_value').pass).toBe(false);
    expect(omittedSchema.run(123).pass).toBe(false);
    // @ts-expect-error - testing non-object value
    expect(omittedSchema.run(null).pass).toBe(false);
  });

  it('Should protect against dangerous prototype keys', () => {
    const schema = { admin: enforce.isBoolean() };
    // @ts-expect-error - 'id' is not a schema key (runtime ignores unknown omit keys)
    const omittedSchema = enforce.omit(schema, ['id']);

    const dangerousValue = JSON.parse('{"__proto__": {"admin": true}}');
    const result = omittedSchema.run(dangerousValue);
    expect(result.pass).toBe(false);
  });

  it('Should fail when schema is not an object', () => {
    const schema = 'not_a_schema';
    // @ts-expect-error - testing non-object schema
    const omittedSchema = enforce.omit(schema, ['id']);

    const result = omittedSchema.run({ id: 1 });
    expect(result.pass).toBe(false);
  });

  it('Should omit everything and accept invalid un-checked properties', () => {
    const schema = { id: enforce.isNumber() };
    const omittedSchema = enforce.omit(schema, ['id']);

    const result = omittedSchema.run({
      id: 'invalid_type_but_omitted',
    });
    expect(result.pass).toBe(true);
  });

  it('Should pass with valid fields and ignore invalid omitted fields', () => {
    const schema = {
      name: enforce.isString(),
      age: enforce.isNumber(),
      email: enforce.isString(),
    };

    const omittedSchema = enforce.omit(schema, ['email']);

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
      email: 123,
    });

    expect(invalidResult.pass).toBe(false);
  });
});
