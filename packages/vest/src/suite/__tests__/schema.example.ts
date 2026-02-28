/**
 * TypeScript Type Enforcement Examples
 *
 * This file demonstrates
 * when using schemas with createSuite. Uncomment the error examples
 * to see TypeScript compilation errors.
 */

import { enforce } from 'n4s';

import { create, test } from '../../vest';

// ✅ CORRECT: Data matches schema
const userSchema = enforce.shape({
  username: enforce.isString(),
  age: enforce.isNumeric().toNumber(),
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

// ✅ This works - data matches schema
validSuite.run({
  username: 'john',
  age: 30,
  email: 'john@example.com',
});

// ❌ UNCOMMENT TO SEE ERROR: Missing required field
// validSuite.run({
//   username: 'john',
//   age: 30,
//   // Missing 'email' - TypeScript error!
// });

// ❌ UNCOMMENT TO SEE ERROR: Wrong type
// validSuite.run({
//   username: 'john',
//   age: '30', // Should be number, not string - TypeScript error!
//   email: 'john@example.com',
// });

// ❌ UNCOMMENT TO SEE ERROR: Extra field not in schema
// validSuite.run({
//   username: 'john',
//   age: 30,
//   email: 'john@example.com',
//   extra: 'not allowed', // TypeScript error for strict shape!
// });

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

// ✅ This works - extra properties allowed with loose
looseSuite.run({
  id: 1,
  name: 'Test',
  extra: 'This is fine with loose schema',
  another: 42,
});

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

// ✅ This works
nestedSuite.run({
  name: 'John',
  address: {
    street: '123 Main St',
    city: 'Springfield',
    zipCode: '12345',
  },
});

// ❌ UNCOMMENT TO SEE ERROR: Wrong nested type
// nestedSuite.run({
//   name: 'John',
//   address: {
//     street: '123 Main St',
//     city: 12345, // Should be string, not number - TypeScript error!
//     zipCode: '12345',
//   },
// });

// ❌ Should fail: callback parameter not typed from schema
const schema = enforce.shape({
  name: enforce.isString(),
  age: enforce.isNumber(),
});

const suite = create(data => {
  // @ts-expect-error - nonexistent property
  void data.nonexistent;
  test('name', () => {
    enforce(data.name).isNotEmpty();
  });
}, schema);

// ❌ Should fail: run accepts wrong shape
// @ts-expect-error: missing required argument
suite.run();
// @ts-expect-error: empty object does not satisfy schema
suite.run({});
// @ts-expect-error: missing age
suite.run({ name: 'John' });
// @ts-expect-error: age wrong type
suite.run({ name: 'John', age: 'not a number' });
// @ts-expect-error: unexpected key
suite.run({ number: 'john' });

// ✅ Should pass: correct shape
suite.run({ name: 'John', age: 42 });

// ✅ Should allow generic typing when no schema
const suite2 = create((data: { foo: string; bar: number }) => {
  test('foo', () => {
    enforce(data.foo).isNotEmpty();
  });
  test('bar', () => {
    enforce(data.bar).greaterThan(0);
  });
});

// @ts-expect-error: missing bar
suite2.run({ foo: 'baz' });
// ✅ Should pass
suite2.run({ foo: 'baz', bar: 1 });

export { validSuite, looseSuite, nestedSuite };
