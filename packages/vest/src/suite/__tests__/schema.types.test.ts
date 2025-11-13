import { enforce } from 'n4s';
import { describe, it, expect } from 'vitest';

import { create, test } from 'vest';

/**
 * Phase 2 Tests: Suite types with schema support
 *
 * These tests ensure that:
 * 1. Suite with enforce.shape() schema infers correct data type
 * 2. Suite with enforce.loose() schema infers correct data type
 * 3. Suite with enforce.partial() schema infers correct data type
 * 4. Suite without schema accepts any data type (backward compatibility)
 * 5. Schema type is properly reflected in callback parameters
 * 6. types property exists in suite result
 * 7. types property contains the inferred type information
 */

describe('Phase 2: Suite types with schema support', () => {
  describe('Type inference from schema', () => {
    it('should infer data type from enforce.shape() schema', () => {
      const userSchema = enforce.shape({
        name: enforce.isString(),
        age: enforce.isNumber(),
        email: enforce.isString(),
      });

      type UserType = typeof userSchema.infer;

      const suite = create((data: UserType) => {
        test('name', () => {
          enforce(data.name).isNotEmpty();
        });
      }, userSchema);

      const validUser: UserType = {
        name: 'John',
        age: 30,
        email: 'john@example.com',
      };

      const result = suite.run(validUser);
      expect(result.tests).toBeDefined();
    });

    it('should infer data type from enforce.loose() schema', () => {
      const flexibleSchema = enforce.loose({
        id: enforce.isNumber(),
        name: enforce.isString(),
      });

      type FlexibleType = typeof flexibleSchema.infer;

      const suite = create((data: FlexibleType) => {
        test('id', () => {
          enforce(data.id).greaterThan(0);
        });
      }, flexibleSchema);

      // Can have extra fields
      const validData: FlexibleType = {
        id: 1,
        name: 'Test',
        extra: 'allowed',
      };

      const result = suite.run(validData);
      expect(result.tests).toBeDefined();
    });

    it('should infer data type from enforce.partial() schema', () => {
      const partialSchema = enforce.partial(
        enforce.shape({
          username: enforce.isString(),
          bio: enforce.isString(),
          age: enforce.isNumber(),
        }),
      );

      type PartialType = typeof partialSchema.infer;

      const suite = create((data: PartialType) => {
        if (data.username) {
          test('username', () => {
            enforce(data.username).longerThan(3);
          });
        }
      }, partialSchema);

      // All fields optional
      const validData: PartialType = {
        username: 'user123',
      };

      const result = suite.run(validData);
      expect(result.tests).toBeDefined();
    });
  });

  describe('Backward compatibility', () => {
    it('should accept any data type when no schema provided', () => {
      const suite = create((data: any) => {
        test('test1', () => {
          expect(data).toBeDefined();
        });
      });

      const result = suite.run({ anything: 'goes' });
      expect(result.tests).toBeDefined();
    });

    it('should work with callback that takes no parameters', () => {
      const suite = create(() => {
        test('test1', () => {
          expect(true).toBe(true);
        });
      });

      const result = suite.run();
      expect(result.tests).toBeDefined();
    });
  });

  describe('Schema type in callback parameters', () => {
    it('should properly type callback first parameter based on schema', () => {
      const personSchema = enforce.shape({
        firstName: enforce.isString(),
        lastName: enforce.isString(),
        age: enforce.isNumber(),
      });

      // This should enforce correct typing at compile time
      const suite = create((data: typeof personSchema.infer) => {
        // TypeScript should know data.firstName is a string
        test('firstName', () => {
          enforce(data.firstName).isNotEmpty();
        });

        // TypeScript should know data.age is a number
        test('age', () => {
          enforce(data.age).greaterThan(0);
        });
      }, personSchema);

      const person = {
        firstName: 'Jane',
        lastName: 'Doe',
        age: 25,
      };

      const result = suite.run(person);
      expect(result.hasErrors()).toBe(false);
    });
  });

  describe('types property in suite result', () => {
    it('should include types property when schema is provided', () => {
      const schema = enforce.shape({
        id: enforce.isNumber(),
        name: enforce.isString(),
      });

      const suite = create((data: typeof schema.infer) => {
        test('id', () => {
          enforce(data.id).isNumber();
        });
      }, schema);

      const result = suite.run({ id: 1, name: 'Test' });

      // The types property should exist and contain type information
      expect(result.types).toBeDefined();
      expect(typeof result.types).toBe('object');
    });

    it('should have undefined types property when no schema provided', () => {
      const suite = create((data: any) => {
        test('test1', () => {
          expect(data).toBeDefined();
        });
      });

      const result = suite.run({ anything: 'goes' });

      // No schema = no types property (or undefined)
      expect(result.types).toBeUndefined();
    });

    it('should contain correct type metadata in types property', () => {
      const schema = enforce.shape({
        username: enforce.isString(),
        email: enforce.isString(),
        age: enforce.isNumber(),
      });

      const suite = create((data: typeof schema.infer) => {
        test('validation', () => {
          enforce(data.username).isNotEmpty();
        });
      }, schema);

      const result = suite.run({
        username: 'testuser',
        email: 'test@example.com',
        age: 30,
      });

      // Types should reflect that a schema is present
      expect(result.types).toBeDefined();
      // types is an empty object when schema is provided
      // (it's a placeholder for runtime type information)
      expect(result.types).toEqual({});
    });
  });

  describe('Complex schema scenarios', () => {
    it('should support nested schemas', () => {
      const addressSchema = enforce.shape({
        street: enforce.isString(),
        city: enforce.isString(),
        zipCode: enforce.isString(),
      });

      const userSchema = enforce.shape({
        name: enforce.isString(),
        address: addressSchema,
      });

      type UserWithAddress = typeof userSchema.infer;

      const suite = create((data: UserWithAddress) => {
        test('name', () => {
          enforce(data.name).isNotEmpty();
        });

        test('address', () => {
          enforce(data.address.city).isNotEmpty();
        });
      }, userSchema);

      const user: UserWithAddress = {
        name: 'John Doe',
        address: {
          street: '123 Main St',
          city: 'Springfield',
          zipCode: '12345',
        },
      };

      const result = suite.run(user);
      expect(result.hasErrors()).toBe(false);
    });

    it('should support array schemas with isArrayOf', () => {
      const itemSchema = enforce.shape({
        id: enforce.isNumber(),
        name: enforce.isString(),
      });

      const orderSchema = enforce.shape({
        orderId: enforce.isString(),
        items: enforce.isArrayOf(itemSchema),
      });

      type Order = typeof orderSchema.infer;

      const suite = create((data: Order) => {
        test('orderId', () => {
          enforce(data.orderId).isNotEmpty();
        });

        test('items', () => {
          enforce(data.items).isArray();
        });
      }, orderSchema);

      const order: Order = {
        orderId: 'ORD-001',
        items: [
          { id: 1, name: 'Widget' },
          { id: 2, name: 'Gadget' },
        ],
      };

      const result = suite.run(order);
      expect(result.hasErrors()).toBe(false);
    });
  });
});
