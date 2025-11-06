import { describe, it, expect, beforeEach } from 'vitest';

import { enforce } from 'n4s-schema';

describe('Schema Rules - Eager Notation', () => {
  describe('enforce.shape() - eager', () => {
    it('should pass with exact matching object', () => {
      expect(() =>
        enforce({
          name: 'John',
          age: 30,
        }).shape({
          name: enforce.isString(),
          age: enforce.isNumber(),
        }),
      ).not.toThrow();
    });

    it('should fail with extra properties', () => {
      expect(() =>
        enforce({
          name: 'John',
          age: 30,
          extra: 'property',
        }).shape({
          name: enforce.isString(),
          age: enforce.isNumber(),
        }),
      ).toThrow();
    });

    it('should fail if a property is missing', () => {
      expect(() =>
        enforce({
          name: 'John',
        }).shape({
          name: enforce.isString(),
          age: enforce.isNumber(),
        }),
      ).toThrow();
    });

    it('should fail if a property has wrong type', () => {
      expect(() =>
        enforce({
          name: 'John',
          age: '30',
        }).shape({
          name: enforce.isString(),
          age: enforce.isNumber(),
        }),
      ).toThrow();
    });

    it('should work with chained rules', () => {
      expect(() =>
        enforce({
          email: 'test@example.com',
          age: 25,
        }).shape({
          email: enforce.isString().matches(/@/),
          age: enforce.isNumber().greaterThan(18),
        }),
      ).not.toThrow();
    });

    it('should fail when chained rule fails', () => {
      expect(() =>
        enforce({
          age: 15,
        }).shape({
          age: enforce.isNumber().greaterThan(18),
        }),
      ).toThrow();
    });

    it('should work with nested shapes', () => {
      expect(() =>
        enforce({
          user: {
            name: {
              first: 'Joseph',
              last: 'Weil',
            },
          },
        }).shape({
          user: enforce.shape({
            name: enforce.shape({
              first: enforce.isString(),
              last: enforce.isString(),
            }),
          }),
        }),
      ).not.toThrow();
    });

    it('should fail with nested shape violation', () => {
      expect(() =>
        enforce({
          user: {
            name: {
              first: 'Joseph',
              last: 123,
            },
          },
        }).shape({
          user: enforce.shape({
            name: enforce.shape({
              first: enforce.isString(),
              last: enforce.isString(),
            }),
          }),
        }),
      ).toThrow();
    });

    it('should pass with empty schema and empty object', () => {
      expect(() => enforce({}).shape({})).not.toThrow();
    });

    it('should fail with empty schema and non-empty object', () => {
      expect(() => enforce({ any: 'value' }).shape({})).toThrow();
    });
  });

  describe('enforce.loose() - eager', () => {
    it('should pass with exact matching object', () => {
      expect(() =>
        enforce({
          name: 'John',
          age: 30,
        }).loose({
          name: enforce.isString(),
          age: enforce.isNumber(),
        }),
      ).not.toThrow();
    });

    it('should pass with extra properties', () => {
      expect(() =>
        enforce({
          name: 'Laura',
          code: 'x23',
        }).loose({
          name: enforce.isString(),
        }),
      ).not.toThrow();
    });

    it('should fail if a required property is missing', () => {
      expect(() =>
        enforce({
          name: 'John',
        }).loose({
          name: enforce.isString(),
          age: enforce.isNumber(),
        }),
      ).toThrow();
    });

    it('should fail if a property has wrong type', () => {
      expect(() =>
        enforce({
          name: 'John',
          age: '30',
        }).loose({
          name: enforce.isString(),
          age: enforce.isNumber(),
        }),
      ).toThrow();
    });

    it('should pass with empty schema and any object', () => {
      expect(() =>
        enforce({ any: 'value', extra: 'fields' }).loose({}),
      ).not.toThrow();
    });

    it('should work with chained rules', () => {
      expect(() =>
        enforce({
          name: 'John Doe',
          age: 30,
          extra: 'allowed',
        }).loose({
          name: enforce.isString().longerThan(5),
          age: enforce.isNumber().isBetween(18, 100),
        }),
      ).not.toThrow();
    });
  });

  describe('enforce.isArrayOf() - eager', () => {
    it('should pass for an array of matching type', () => {
      expect(() =>
        enforce([1, 2, 3]).isArrayOf(enforce.isNumber()),
      ).not.toThrow();
    });

    it('should fail for an array with mixed types', () => {
      expect(() =>
        enforce([1, '2', 3]).isArrayOf(enforce.isNumber()),
      ).toThrow();
    });

    it('should pass for an empty array', () => {
      expect(() => enforce([]).isArrayOf(enforce.isNumber())).not.toThrow();
    });

    it('should fail if not an array', () => {
      expect(() =>
        // @ts-expect-error - intentionally testing invalid input
        enforce({ not: 'an array' }).isArrayOf(enforce.isNumber()),
      ).toThrow();
    });

    it('should pass for mixed types when multiple rules are provided', () => {
      expect(() =>
        enforce([1, '2', 3]).isArrayOf(enforce.isNumber(), enforce.isString()),
      ).not.toThrow();
    });

    it('should fail when a type is not in the allowed rules', () => {
      expect(() =>
        enforce([1, '2', true]).isArrayOf(
          enforce.isNumber(),
          enforce.isString(),
        ),
      ).toThrow();
    });

    it('should work with chained rules', () => {
      expect(() =>
        enforce(['test@example.com', 'another@example.com']).isArrayOf(
          enforce.isString().matches(/@/),
        ),
      ).not.toThrow();
    });

    it('should fail when chained rule fails for any element', () => {
      expect(() =>
        enforce(['test@example.com', 'invalid']).isArrayOf(
          enforce.isString().matches(/@/),
        ),
      ).toThrow();
    });

    it('should combine with other array rules', () => {
      expect(() =>
        enforce([1, 2, 3])
          .isArrayOf(enforce.isNumber().lessThan(10))
          .longerThan(2),
      ).not.toThrow();
    });

    it('should work within shape', () => {
      expect(() =>
        enforce({
          data: [1, 2, 3],
        }).shape({
          data: enforce.isArrayOf(enforce.isNumber()),
        }),
      ).not.toThrow();
    });

    it('should fail within shape when array content is invalid', () => {
      expect(() =>
        enforce({
          data: [1, '2', 3],
        }).shape({
          data: enforce.isArrayOf(enforce.isNumber()),
        }),
      ).toThrow();
    });
  });

  describe('enforce.optional() - eager', () => {
    it('should pass with null value', () => {
      expect(() =>
        enforce({
          firstName: 'Rick',
          lastName: 'Sanchez',
          middleName: null,
        }).shape({
          firstName: enforce.isString(),
          middleName: enforce.optional(enforce.isString()),
          lastName: enforce.isString(),
        }),
      ).not.toThrow();
    });

    it('should pass with undefined value', () => {
      expect(() =>
        enforce({
          firstName: 'Rick',
          lastName: 'Sanchez',
          middleName: undefined,
        }).shape({
          firstName: enforce.isString(),
          middleName: enforce.optional(enforce.isString()),
          lastName: enforce.isString(),
        }),
      ).not.toThrow();
    });

    it('should pass with missing property', () => {
      expect(() =>
        enforce({
          firstName: 'Rick',
          lastName: 'Sanchez',
        }).shape({
          firstName: enforce.isString(),
          middleName: enforce.optional(enforce.isString()),
          lastName: enforce.isString(),
        }),
      ).not.toThrow();
    });

    it('should pass with valid value', () => {
      expect(() =>
        enforce({
          firstName: 'Rick',
          middleName: 'C-137',
          lastName: 'Sanchez',
        }).shape({
          firstName: enforce.isString(),
          middleName: enforce.optional(enforce.isString()),
          lastName: enforce.isString(),
        }),
      ).not.toThrow();
    });

    it('should fail with invalid value type', () => {
      expect(() =>
        enforce({
          firstName: 'Rick',
          middleName: 123,
          lastName: 'Sanchez',
        }).shape({
          firstName: enforce.isString(),
          middleName: enforce.optional(enforce.isString()),
          lastName: enforce.isString(),
        }),
      ).toThrow();
    });

    it('should work with chained rules', () => {
      expect(() =>
        enforce({
          name: 'John',
          email: 'test@example.com',
        }).shape({
          name: enforce.isString(),
          email: enforce.optional(enforce.isString().matches(/@/)),
        }),
      ).not.toThrow();
    });

    it('should fail when optional chained rule fails', () => {
      expect(() =>
        enforce({
          name: 'John',
          email: 'invalid-email',
        }).shape({
          name: enforce.isString(),
          email: enforce.optional(enforce.isString().matches(/@/)),
        }),
      ).toThrow();
    });
  });

  describe('enforce.partial() - eager', () => {
    it('should pass with subset of properties', () => {
      expect(() =>
        enforce({
          firstName: 'John',
        }).shape(
          enforce.partial({
            firstName: enforce.isString(),
            lastName: enforce.isString(),
          }),
        ),
      ).not.toThrow();
    });

    it('should pass with empty object', () => {
      expect(() =>
        enforce({}).shape(
          enforce.partial({
            firstName: enforce.isString(),
            lastName: enforce.isString(),
          }),
        ),
      ).not.toThrow();
    });

    it('should pass with all properties', () => {
      expect(() =>
        enforce({
          firstName: 'John',
          lastName: 'Doe',
        }).shape(
          enforce.partial({
            firstName: enforce.isString(),
            lastName: enforce.isString(),
          }),
        ),
      ).not.toThrow();
    });

    it('should fail with wrong type for provided property', () => {
      expect(() =>
        enforce({
          firstName: 123,
        }).shape(
          enforce.partial({
            firstName: enforce.isString(),
            lastName: enforce.isString(),
          }),
        ),
      ).toThrow();
    });

    it('should work with chained rules', () => {
      expect(() =>
        enforce({
          age: 25,
        }).shape(
          enforce.partial({
            age: enforce.isNumber().greaterThan(18),
            name: enforce.isString().longerThan(2),
          }),
        ),
      ).not.toThrow();
    });

    it('should fail when chained rule fails on provided property', () => {
      expect(() =>
        enforce({
          age: 15,
        }).shape(
          enforce.partial({
            age: enforce.isNumber().greaterThan(18),
            name: enforce.isString(),
          }),
        ),
      ).toThrow();
    });
  });

  describe('Complex integration scenarios - eager', () => {
    it('should validate deeply nested objects with shape', () => {
      expect(() =>
        enforce({
          user: {
            profile: {
              contact: {
                email: 'test@example.com',
              },
              age: 25,
            },
          },
        }).shape({
          user: enforce.shape({
            profile: enforce.shape({
              contact: enforce.shape({
                email: enforce.isString().matches(/@/),
              }),
              age: enforce.isNumber().greaterThan(18),
            }),
          }),
        }),
      ).not.toThrow();
    });

    it('should combine shape with isArrayOf', () => {
      expect(() =>
        enforce({
          username: 'johndoe',
          tags: ['javascript', 'typescript', 'node'],
        }).shape({
          username: enforce.isString(),
          tags: enforce.isArrayOf(enforce.isString().longerThan(2)),
        }),
      ).not.toThrow();
    });

    it('should combine loose with optional and isArrayOf', () => {
      expect(() =>
        enforce({
          name: 'Product',
          categories: ['tech', 'gadgets'],
          extraField: 'allowed',
        }).loose({
          name: enforce.isString(),
          categories: enforce.isArrayOf(enforce.isString()),
          description: enforce.optional(enforce.isString()),
        }),
      ).not.toThrow();
    });

    it('should work with allOf in shape', () => {
      expect(() =>
        enforce({
          password: 'SecureP@ss123',
        }).shape({
          password: enforce.allOf(
            enforce.isString(),
            enforce.isString().longerThan(8),
            enforce.isString().matches(/[A-Z]/),
            enforce.isString().matches(/[0-9]/),
          ),
        }),
      ).not.toThrow();
    });

    it('should work with anyOf in shape', () => {
      expect(() =>
        enforce({
          identifier: 'user@example.com',
        }).shape({
          identifier: enforce.anyOf(
            enforce.isString().matches(/@/),
            enforce.isString().matches(/^\d+$/),
          ),
        }),
      ).not.toThrow();
    });

    it('should validate array of objects with isArrayOf and shape', () => {
      expect(() =>
        enforce({
          users: [
            { name: 'John', age: 30 },
            { name: 'Jane', age: 25 },
          ],
        }).shape({
          users: enforce.isArrayOf(
            enforce.shape({
              name: enforce.isString(),
              age: enforce.isNumber(),
            }),
          ),
        }),
      ).not.toThrow();
    });

    it('should fail when array of objects has invalid nested property', () => {
      expect(() =>
        enforce({
          users: [
            { name: 'John', age: 30 },
            { name: 'Jane', age: '25' },
          ],
        }).shape({
          users: enforce.isArrayOf(
            enforce.shape({
              name: enforce.isString(),
              age: enforce.isNumber(),
            }),
          ),
        }),
      ).toThrow();
    });
  });

  describe('Custom rules with schema rules - eager', () => {
    beforeEach(() => {
      enforce.extend({
        isEmail: (value: string) =>
          /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value),
        isAdult: (value: number) => value >= 18,
        isFriendTheSameAsUser: (value: string) => {
          const context = enforce.context();
          if (value === context?.parent()?.parent()?.value.username) {
            return {
              pass: false,
              message: () => 'Friend cannot be the same as username',
            };
          }
          return true;
        },
      });
    });

    it('should work with custom rules in shape', () => {
      expect(() =>
        enforce({
          email: 'test@example.com',
          age: 25,
        }).shape({
          email: enforce.isString().isEmail(),
          age: enforce.isNumber().isAdult(),
        }),
      ).not.toThrow();
    });

    it('should fail when custom rule fails in shape', () => {
      expect(() =>
        enforce({
          email: 'invalid',
          age: 16,
        }).shape({
          email: enforce.isString().isEmail(),
          age: enforce.isNumber().isAdult(),
        }),
      ).toThrow();
    });

    it('should work with custom rules in isArrayOf', () => {
      expect(() =>
        enforce({
          emails: ['test@example.com', 'another@example.com'],
        }).shape({
          emails: enforce.isArrayOf(enforce.isString().isEmail()),
        }),
      ).not.toThrow();
    });

    it('should work with context-aware custom rules', () => {
      expect(() =>
        enforce({
          username: 'johndoe',
          friends: ['Mike', 'Jim'],
        }).shape({
          username: enforce.isString(),
          friends: enforce.isArrayOf(
            enforce.isString().isFriendTheSameAsUser(),
          ),
        }),
      ).not.toThrow();
    });

    // Note: Context traversal in nested schema rules (shape/isArrayOf) is not yet fully implemented
    it('should fail when context-aware custom rule fails', () => {
      expect(() =>
        enforce({
          username: 'johndoe',
          friends: ['Mike', 'Jim', 'johndoe'],
        }).shape({
          username: enforce.isString(),
          friends: enforce.isArrayOf(
            enforce.isString().isFriendTheSameAsUser(),
          ),
        }),
      ).toThrow('Friend cannot be the same as username');
    });
  });

  describe('Error messages with schema rules - eager', () => {
    it('should throw descriptive error for shape validation', () => {
      expect(() =>
        enforce({
          name: 'John',
          age: '30',
        }).shape({
          name: enforce.isString(),
          age: enforce.isNumber(),
        }),
      ).toThrow(/enforce/);
    });

    it('should support custom messages with .message()', () => {
      expect(() =>
        enforce({
          age: 15,
        })
          .message('Age must be valid')
          .shape({
            age: enforce.isNumber().greaterThan(18),
          }),
      ).toThrow('Age must be valid');
    });

    it('should support custom messages on nested rules', () => {
      expect(() =>
        enforce({
          user: {
            age: 15,
          },
        }).shape({
          user: enforce.shape({
            age: enforce.isNumber().greaterThan(18),
          }),
        }),
      ).toThrow(/enforce/);
    });
  });

  describe('Edge cases - eager', () => {
    it('should handle null and undefined values in shape', () => {
      expect(() =>
        enforce({
          name: null,
        }).shape({
          name: enforce.optional(enforce.isString()),
        }),
      ).not.toThrow();
    });

    it('should handle empty arrays in isArrayOf', () => {
      expect(() =>
        enforce({
          items: [],
        }).shape({
          items: enforce.isArrayOf(enforce.isNumber()),
        }),
      ).not.toThrow();
    });

    it('should handle deeply nested optional fields', () => {
      expect(() =>
        enforce({
          user: {
            profile: {},
          },
        }).shape({
          user: enforce.shape({
            profile: enforce.shape({
              bio: enforce.optional(enforce.isString()),
            }),
          }),
        }),
      ).not.toThrow();
    });

    it('should handle mixed optional and required fields', () => {
      expect(() =>
        enforce({
          required: 'value',
        }).shape({
          required: enforce.isString(),
          optional1: enforce.optional(enforce.isString()),
          optional2: enforce.optional(enforce.isNumber()),
        }),
      ).not.toThrow();
    });

    it('should handle arrays of different types with multiple isArrayOf rules', () => {
      expect(() =>
        enforce([1, '2', 3, 'four']).isArrayOf(
          enforce.isNumber(),
          enforce.isString(),
        ),
      ).not.toThrow();
    });
  });

  describe('Chaining schema rules - eager', () => {
    it('should allow chaining after shape validation', () => {
      expect(() =>
        enforce({
          items: [1, 2, 3],
        })
          .shape({
            items: enforce.isArray(),
          })
          .isNotEmpty(),
      ).not.toThrow();
    });

    it('should allow chaining multiple validations', () => {
      expect(() =>
        enforce([1, 2, 3])
          .isArrayOf(enforce.isNumber())
          .longerThan(2)
          .shorterThan(10),
      ).not.toThrow();
    });
  });
});
