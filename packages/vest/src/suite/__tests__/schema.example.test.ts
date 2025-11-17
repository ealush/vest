/**
 * TypeScript Type Enforcement Examples
 *
 * This file demonstrates that TypeScript properly enforces types
 * when using schemas with createSuite. Uncomment the error examples
 * to see TypeScript compilation errors.
 */

import { enforce } from 'n4s';
import { describe, it } from 'vitest';

import { create, test } from 'vest';

// ✅ CORRECT: Data matches schema
const userSchema = enforce.shape({
  username: enforce.isString(),
  age: enforce.isNumber(),
  email: enforce.isString(),
});

const validSuite = create(data => {
  // TypeScript knows the exact shape of data:
  // data.username: string
  // data.age: number
  // data.email: string

  test('username', () => {
    enforce(data.username).isNotEmpty();
  });

  test('age', () => {
    enforce(data.age).greaterThan(0);
  });
}, userSchema);

// ✅ LOOSE SCHEMA: Allows extra properties
const looseSchema = enforce.loose({
  id: enforce.isNumber(),
  name: enforce.isString(),
});

const looseSuite = create(data => {
  // TypeScript knows about id and name
  test('id', () => {
    enforce(data.id).isNumber();
  });
}, looseSchema);

// ✅ NESTED SCHEMAS: Full type inference
const addressSchema = enforce.shape({
  street: enforce.isString(),
  city: enforce.isString(),
  zipCode: enforce.isString(),
});

const personSchema = enforce.shape({
  name: enforce.isString(),
  address: addressSchema,
});

const nestedSuite = create(data => {
  // TypeScript knows the full nested structure
  // data.name: string
  // data.address.street: string
  // data.address.city: string
  // data.address.zipCode: string

  test('city', () => {
    enforce(data.address.city).isNotEmpty();
  });
}, personSchema);

// ❌ Should fail: callback parameter not typed from schema
const schema = enforce.shape({
  name: enforce.isString(),
  age: enforce.isNumber(),
});

const suite = create(data => {
  // @ts-expect-error: data should be strictly typed
  data.nonexistent;
  test('name', () => {
    enforce(data.name).isNotEmpty();
  });
}, schema);

// ✅ Should allow generic typing when no schema
const suite2 = create<{ foo: string; bar: number }>(data => {
  test('foo', () => {
    enforce(data.foo).isNotEmpty();
  });
  test('bar', () => {
    enforce(data.bar).greaterThan(0);
  });
});

describe('schema typing examples', () => {
  it('runs strict schema suites with correct data', () => {
    validSuite.run({
      username: 'john',
      age: 30,
      email: 'john@example.com',
    });
  });

  it('allows extra properties with loose schema', () => {
    looseSuite.run({
      id: 1,
      name: 'Test',
      extra: 'This is fine with loose schema',
      another: 42,
    });
  });

  it('resolves nested schemas', () => {
    nestedSuite.run({
      name: 'John',
      address: {
        street: '123 Main St',
        city: 'Springfield',
        zipCode: '12345',
      },
    });
  });

  it('accepts correct shapes when no schema but explicit generic is provided', () => {
    suite2.run({ foo: 'baz', bar: 1 });
  });
});

export { validSuite, looseSuite, nestedSuite };
