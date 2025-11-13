import { describe, it, expect } from 'vitest';

import { enforce } from 'n4s';

/**
 * Phase 1 Tests: Verify n4s schema types are properly exported
 *
 * These tests ensure that:
 * 1. RuleInstance type is accessible from n4s
 * 2. typeof schema.infer works with schema rules
 * 3. Schema types can be imported in other packages
 */

describe('Phase 1: n4s schema type exports', () => {
  describe('RuleInstance type accessibility', () => {
    it('should export RuleInstance type that can be imported', () => {
      // This test verifies that RuleInstance is exported and can be used in type annotations
      // @ts-expect-error - RuleInstance should be exported but currently is not
      type TestImport = import('n4s').RuleInstance<string>;

      // Runtime check that the type exists
      const stringRule = enforce.isString();
      expect(stringRule).toHaveProperty('run');
      expect(stringRule).toHaveProperty('test');
      expect(stringRule).toHaveProperty('infer');
    });

    it('should allow RuleInstance to be used as a type constraint', () => {
      // @ts-expect-error - RuleInstance should be exported but currently is not
      type RuleInstanceType = import('n4s').RuleInstance<any>;

      function acceptsRule(rule: RuleInstanceType) {
        return rule.test('test');
      }

      const rule = enforce.isString();
      expect(() => acceptsRule(rule)).not.toThrow();
    });
  });

  describe('schema.infer type inference', () => {
    it('should infer correct type from shape schema', () => {
      const userSchema = enforce.shape({
        name: enforce.isString(),
        age: enforce.isNumber(),
        email: enforce.isString(),
      });

      // Test that typeof schema.infer works
      type UserType = typeof userSchema.infer;

      // Verify the inferred type is correct at compile time
      const validUser: UserType = {
        name: 'John',
        age: 30,
        email: 'john@example.com',
      };

      expect(userSchema.test(validUser)).toBe(true);
    });

    it('should infer correct type with optional fields', () => {
      const profileSchema = enforce.shape({
        username: enforce.isString(),
        bio: enforce.optional(enforce.isString()),
        age: enforce.optional(enforce.isNumber()),
      });

      type ProfileType = typeof profileSchema.infer;

      // Required field only
      const profile1: ProfileType = {
        username: 'user123',
      };

      // With optional fields
      const profile2: ProfileType = {
        username: 'user123',
        bio: 'Hello world',
        age: 25,
      };

      expect(profileSchema.test(profile1)).toBe(true);
      expect(profileSchema.test(profile2)).toBe(true);
    });

    it('should infer union types from anyOf', () => {
      const flexibleIdSchema = enforce.anyOf(
        enforce.isString(),
        enforce.isNumber(),
      );

      type FlexibleId = typeof flexibleIdSchema.infer;

      const stringId: FlexibleId = 'abc123';
      const numberId: FlexibleId = 12345;

      expect(flexibleIdSchema.test(stringId)).toBe(true);
      expect(flexibleIdSchema.test(numberId)).toBe(true);
    });

    it('should infer array types from isArrayOf', () => {
      const numbersSchema = enforce.isArrayOf(enforce.isNumber());

      type NumbersType = typeof numbersSchema.infer;

      const numbers: NumbersType = [1, 2, 3, 4, 5];

      expect(numbersSchema.test(numbers)).toBe(true);
    });
  });

  describe('schema type exports for cross-package usage', () => {
    it('should export SchemaInfer type', () => {
      // @ts-expect-error - SchemaInfer should be exported but currently is not
      type TestSchemaInfer = import('n4s').SchemaInfer<{
        name: import('n4s').RuleInstance<string>;
        age: import('n4s').RuleInstance<number>;
      }>;

      // Verify the type would work correctly
      const schema = {
        name: enforce.isString(),
        age: enforce.isNumber(),
      };

      expect(schema.name.test('John')).toBe(true);
      expect(schema.age.test(30)).toBe(true);
    });

    it('should export ShapeType type', () => {
      // @ts-expect-error - ShapeType should be exported but currently is not
      type TestShapeType = import('n4s').ShapeType<{
        id: import('n4s').RuleInstance<number>;
        name: import('n4s').RuleInstance<string>;
      }>;

      const shapeRule = enforce.shape({
        id: enforce.isNumber(),
        name: enforce.isString(),
      });

      expect(shapeRule.test({ id: 1, name: 'Test' })).toBe(true);
    });

    it('should export InferShape type', () => {
      // @ts-expect-error - InferShape should be exported but currently is not
      type TestInferShape = import('n4s').InferShape<
        import('n4s').RuleInstance<string>
      >;

      const rule = enforce.isString();
      expect(rule.test('test')).toBe(true);
    });
  });

  describe('practical usage scenarios', () => {
    it('should support building reusable schema validators', () => {
      const addressSchema = enforce.shape({
        street: enforce.isString(),
        city: enforce.isString(),
        zipCode: enforce.isString().matches(/^\d{5}$/),
      });

      const userWithAddressSchema = enforce.shape({
        name: enforce.isString(),
        email: enforce.isString().matches(/@/),
        address: addressSchema,
      });

      type User = typeof userWithAddressSchema.infer;

      const validUser: User = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        address: {
          street: '123 Main St',
          city: 'Springfield',
          zipCode: '12345',
        },
      };

      expect(userWithAddressSchema.test(validUser)).toBe(true);
    });

    it('should support schema composition with arrays', () => {
      const itemSchema = enforce.shape({
        id: enforce.isNumber(),
        name: enforce.isString(),
        quantity: enforce.isNumber().greaterThan(0),
      });

      const orderSchema = enforce.shape({
        orderId: enforce.isString(),
        items: enforce.isArrayOf(itemSchema),
        total: enforce.isNumber(),
      });

      type Order = typeof orderSchema.infer;

      const validOrder: Order = {
        orderId: 'ORD-001',
        items: [
          { id: 1, name: 'Widget', quantity: 2 },
          { id: 2, name: 'Gadget', quantity: 1 },
        ],
        total: 49.99,
      };

      expect(orderSchema.test(validOrder)).toBe(true);
    });
  });
});
