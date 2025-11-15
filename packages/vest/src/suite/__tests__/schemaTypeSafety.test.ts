import { describe, it, expect } from 'vitest';

import { enforce } from 'n4s';
import { create, test } from 'vest';

/**
 * Type Safety Tests
 *
 * These tests demonstrate that TypeScript properly enforces types
 * when using schemas with createSuite.
 */

describe('Schema Type Safety', () => {
  it('should allow valid data that matches schema', () => {
    const schema = enforce.shape({
      username: enforce.isString(),
      age: enforce.isNumber(),
    });

    const suite = create(data => {
      test('username', () => {
        enforce(data.username).isNotEmpty();
      });
      test('age', () => {
        enforce(data.age).greaterThan(0);
      });
    }, schema);

    // This should compile and work
    const result = suite.run({ username: 'john', age: 30 });
    expect(result.hasErrors()).toBe(false);
  });

  it('callback parameter has correct type inference', () => {
    const schema = enforce.shape({
      email: enforce.isString(),
      count: enforce.isNumber(),
    });

    const suite = create(data => {
      // TypeScript knows data.email is a string
      expect(data.email.length).toBeGreaterThan(0);

      // TypeScript knows data.count is a number
      expect(data.count).toBeGreaterThan(0);

      test('email', () => {
        enforce(data.email).isNotEmpty();
      });

      test('count', () => {
        enforce(data.count).isNumber();
      });
    }, schema);

    const result = suite.run({ email: 'test@example.com', count: 5 });
    expect(result.hasErrors()).toBe(false);
  });

  it('nested schema properties are properly typed', () => {
    const addressSchema = enforce.shape({
      street: enforce.isString(),
      city: enforce.isString(),
      zipCode: enforce.isString(),
    });

    const userSchema = enforce.shape({
      name: enforce.isString(),
      address: addressSchema,
    });

    const suite = create(data => {
      // TypeScript knows data.address.city is a string
      expect(data.address.city.length).toBeGreaterThan(0);

      test('city', () => {
        enforce(data.address.city).isNotEmpty();
      });
    }, userSchema);

    const result = suite.run({
      name: 'John',
      address: {
        street: '123 Main St',
        city: 'Springfield',
        zipCode: '12345',
      },
    });

    expect(result.hasErrors()).toBe(false);
  });

  it('loose schema allows extra properties', () => {
    const schema = enforce.loose({
      id: enforce.isNumber(),
      name: enforce.isString(),
    });

    const suite = create(data => {
      // TypeScript knows about id and name
      expect(data.id).toBeGreaterThan(0);
      expect(data.name.length).toBeGreaterThan(0);

      test('id', () => {
        enforce(data.id).isNumber();
      });
    }, schema);

    // Extra properties are allowed with loose schema
    const result = suite.run({
      id: 1,
      name: 'Test',
      extra: 'This is fine',
      another: 42,
    });

    expect(result.hasErrors()).toBe(false);
  });

  it('suite without schema accepts any data', () => {
    const suite = create((data: any) => {
      test('test', () => {
        expect(data).toBeDefined();
      });
    });

    // Without schema, any data is accepted
    const result1 = suite.run({ anything: 'goes' });
    const result2 = suite.run([1, 2, 3]);
    const result3 = suite.run('string');
    const result4 = suite.run(42);

    expect(result1.hasErrors()).toBe(false);
    expect(result2.hasErrors()).toBe(false);
    expect(result3.hasErrors()).toBe(false);
    expect(result4.hasErrors()).toBe(false);
  });

  describe('non-compliant schema runs', () => {
    const schema = enforce.shape({
      name: enforce.isString(),
      number: enforce.isNumber(),
    });
    const suite = create(data => {
      test('name', () => {
        enforce(data.name).isString();
      });
      test('number', () => {
        enforce(data.number).isNumber();
      });
    }, schema);

    it('should fail when run() is called with no arguments', () => {
      // @ts-expect-error - run requires argument matching schema
      const result = suite.run();
      expect(result.hasErrors()).toBe(true);
    });

    it('should fail when run() is called with empty object', () => {
      // @ts-expect-error - empty object does not satisfy schema
      const result = suite.run({});
      expect(result.hasErrors()).toBe(true);
    });

    it('should fail when run() is called with incorrect object values', () => {
      // @ts-expect-error - incorrect property values violate schema
      const result = suite.run({ name: 100, number: true });
      expect(result.hasErrors()).toBe(true);
    });
  });
});
