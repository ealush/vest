import { isNullish, isObject } from 'vest-utils';
import { describe, it, expect, beforeEach } from 'vitest';

import { enforce } from '../n4s';

type ContextRuleResult =
  | boolean
  | { pass: boolean; message?: string | (() => string) };

declare global {
  // eslint-disable-next-line no-unused-vars
  namespace n4s {
    // eslint-disable-next-line no-unused-vars
    interface EnforceMatchers {
      hasContext: (_value: unknown) => ContextRuleResult;
      checkContextStructure: (_value: unknown) => ContextRuleResult;
      checkValue: (_value: unknown) => ContextRuleResult;
      checkMetaName: (
        _value: unknown,
        _expectedName: string,
      ) => ContextRuleResult;
      checkMetaIndex: (
        _value: unknown,
        _expectedIndex: number,
      ) => ContextRuleResult;
      hasMetaIndex: (_value: unknown) => ContextRuleResult;
      hasParent: (_value: unknown) => ContextRuleResult;
      canAccessParent: (_value: unknown) => ContextRuleResult;
      matchesParentUsername: (_value: string) => ContextRuleResult;
      differentFromParentUsername: (_value: string) => ContextRuleResult;
      isFriendTheSameAsUser: (_value: string) => ContextRuleResult;
      emailMatchesUsername: (_value: string) => ContextRuleResult;
      matchesTopLevelId: (_value: string) => ContextRuleResult;
      notSameAsSibling: (
        _value: string,
        _siblingKey: string,
      ) => ContextRuleResult;
      uniqueInArray: (_value: unknown) => ContextRuleResult;
      passwordsMatch: (_value: string) => ContextRuleResult;
      checkParentIsNull: (_value: unknown) => ContextRuleResult;
      requiredIfOtherFieldPresent: (
        _value: unknown,
        _otherField: string,
      ) => ContextRuleResult;
      differentFromUsername: (_value: string) => ContextRuleResult;
      minAgeIfCountry: (
        _value: number,
        _country: string,
        _minAge: number,
      ) => ContextRuleResult;
      matchesParentId: (_value: string) => ContextRuleResult;
      safeParentAccess: (_value: unknown) => ContextRuleResult;
      arrayLengthMatchesCount: (_value: any[]) => ContextRuleResult;
    }
  }
}

describe('enforce.context() API', () => {
  describe('Basic context access', () => {
    beforeEach(() => {
      enforce.extend({
        hasContext: () => {
          const context = enforce.context();
          return !isNullish(context);
        },
      });
    });

    it('should provide context within custom rules', () => {
      expect(() => enforce('test').hasContext()).not.toThrow();
    });

    // Context is not available in lazy mode (when building rule chain)
    it('should work in lazy mode', () => {
      const result = enforce.hasContext().run('test');
      expect(result.pass).toBe(true);
    });
  });

  describe('Context structure', () => {
    beforeEach(() => {
      enforce.extend({
        checkContextStructure: () => {
          const context = enforce.context();
          return (
            isObject(context) &&
            'value' in context &&
            'meta' in context &&
            'parent' in context
          );
        },
      });
    });

    it('should have value, meta, and parent properties', () => {
      expect(() => enforce('test').checkContextStructure()).not.toThrow();
    });
  });

  describe('Context value property', () => {
    beforeEach(() => {
      enforce.extend({
        checkValue: (value: any) => {
          const context = enforce.context();
          return context?.value === value;
        },
      });
    });

    it('should contain the current value being validated', () => {
      expect(() => enforce('test').checkValue()).not.toThrow();
      expect(() => enforce(123).checkValue()).not.toThrow();
      expect(() => enforce({ key: 'value' }).checkValue()).not.toThrow();
    });

    it('should work with different data types', () => {
      const testCases = [
        'string',
        123,
        true,
        null,
        undefined,
        { key: 'value' },
        [1, 2, 3],
      ];

      testCases.forEach(testCase => {
        expect(() => enforce(testCase).checkValue()).not.toThrow();
      });
    });
  });

  describe('Context meta property within shape', () => {
    beforeEach(() => {
      enforce.extend({
        checkMetaName: (_value: any, expectedName: string) => {
          const context = enforce.context();
          return context?.meta?.key === expectedName;
        },
      });
    });

    // Context meta within schema rules is not yet fully implemented
    it('should contain the property name when used in shape', () => {
      expect(() =>
        enforce({
          username: 'johndoe',
        }).shape({
          username: enforce.isString().checkMetaName('username'),
        }),
      ).not.toThrow();
    });

    // Context meta within schema rules is not yet fully implemented
    it('should work with multiple properties', () => {
      expect(() =>
        enforce({
          firstName: 'John',
          lastName: 'Doe',
          age: 30,
        }).shape({
          firstName: enforce.isString().checkMetaName('firstName'),
          lastName: enforce.isString().checkMetaName('lastName'),
          age: enforce.isNumber().checkMetaName('age'),
        }),
      ).not.toThrow();
    });

    // Context is not available in lazy mode
    it('should work in lazy mode', () => {
      const schema = enforce.shape({
        username: enforce.isString().checkMetaName('username'),
      });

      const result = schema.run({ username: 'johndoe' });
      expect(result.pass).toBe(true);
    });
  });

  describe('Context meta property within isArrayOf', () => {
    beforeEach(() => {
      enforce.extend({
        checkMetaIndex: (_value: any, expectedIndex: number) => {
          const context = enforce.context();
          return context?.meta?.index === expectedIndex;
        },
        hasMetaIndex: () => {
          const context = enforce.context();
          return typeof context?.meta?.index === 'number';
        },
      });
    });

    it('should contain the array index when used in isArrayOf', () => {
      expect(() =>
        enforce({
          items: ['first', 'second', 'third'],
        }).shape({
          items: enforce.isArrayOf(enforce.isString().hasMetaIndex()),
        }),
      ).not.toThrow();
    });

    it('should have correct index values', () => {
      // Note: This test checks that meta.index exists, but checking specific
      // index values would require multiple custom rules or advanced logic
      expect(() =>
        enforce(['a', 'b', 'c']).isArrayOf(enforce.isString().hasMetaIndex()),
      ).not.toThrow();
    });
  });

  describe('Context parent traversal', () => {
    beforeEach(() => {
      enforce.extend({
        hasParent: () => {
          const context = enforce.context();
          return typeof context?.parent === 'function';
        },
        canAccessParent: () => {
          const context = enforce.context();
          const parent = context?.parent();
          return parent !== null;
        },
      });
    });

    it('should provide parent function in context', () => {
      expect(() =>
        enforce({
          nested: {
            value: 'test',
          },
        }).shape({
          nested: enforce.shape({
            value: enforce.isString().hasParent(),
          }),
        }),
      ).not.toThrow();
    });

    it('should allow accessing parent context', () => {
      expect(() =>
        enforce({
          nested: {
            value: 'test',
          },
        }).shape({
          nested: enforce.shape({
            value: enforce.isString().canAccessParent(),
          }),
        }),
      ).not.toThrow();
    });
  });

  describe('Accessing parent values - single level', () => {
    beforeEach(() => {
      enforce.extend({
        matchesParentUsername: (value: string) => {
          const context = enforce.context();
          const parent = context?.parent();
          return value === parent?.value.username;
        },
        differentFromParentUsername: (value: string) => {
          const context = enforce.context();
          const parent = context?.parent();
          return value !== parent?.value.username;
        },
      });
    });

    it('should access parent value for validation', () => {
      expect(() =>
        enforce({
          username: 'johndoe',
          displayName: 'johndoe',
        }).shape({
          username: enforce.isString(),
          displayName: enforce.isString().matchesParentUsername(),
        }),
      ).not.toThrow();
    });

    it('should fail when parent value does not match', () => {
      expect(() =>
        enforce({
          username: 'johndoe',
          displayName: 'different',
        }).shape({
          username: enforce.isString(),
          displayName: enforce.isString().matchesParentUsername(),
        }),
      ).toThrow();
    });

    it('should validate that value is different from parent property', () => {
      expect(() =>
        enforce({
          username: 'johndoe',
          displayName: 'different',
        }).shape({
          username: enforce.isString(),
          displayName: enforce.isString().differentFromParentUsername(),
        }),
      ).not.toThrow();
    });
  });

  describe('Accessing parent values - multiple levels (Documentation example)', () => {
    beforeEach(() => {
      enforce.extend({
        isFriendTheSameAsUser: (value: string) => {
          const context = enforce.context();

          if (value === context?.parent()?.parent()?.value.username) {
            return { pass: false };
          }

          return true;
        },
      });
    });

    it('should traverse two levels up to access username', () => {
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

    it('should fail when friend name matches username', () => {
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
      ).toThrow();
    });

    it('should work with empty friends array', () => {
      expect(() =>
        enforce({
          username: 'johndoe',
          friends: [],
        }).shape({
          username: enforce.isString(),
          friends: enforce.isArrayOf(
            enforce.isString().isFriendTheSameAsUser(),
          ),
        }),
      ).not.toThrow();
    });
  });

  describe('Complex nested object validation with context', () => {
    beforeEach(() => {
      enforce.extend({
        emailMatchesUsername: (value: string) => {
          const context = enforce.context();
          const parent = context?.parent();
          const username = parent?.value.username;
          // Email should start with username
          return value.startsWith(username + '@');
        },
      });
    });

    it('should validate email based on username in parent', () => {
      expect(() =>
        enforce({
          username: 'john',
          email: 'john@example.com',
        }).shape({
          username: enforce.isString(),
          email: enforce.isString().emailMatchesUsername(),
        }),
      ).not.toThrow();
    });

    it('should fail when email does not match username pattern', () => {
      expect(() =>
        enforce({
          username: 'john',
          email: 'jane@example.com',
        }).shape({
          username: enforce.isString(),
          email: enforce.isString().emailMatchesUsername(),
        }),
      ).toThrow();
    });
  });

  describe('Deeply nested context traversal', () => {
    beforeEach(() => {
      enforce.extend({
        matchesTopLevelId: (value: string) => {
          const context = enforce.context();
          // Traverse up to the top-level (four levels from leaf)
          const topLevel = context?.parent()?.parent()?.parent()?.parent()
            ?.value.id;
          return value === topLevel;
        },
      });
    });

    it('should access deeply nested parent values', () => {
      expect(() =>
        enforce({
          id: 'top-level-id',
          level1: {
            level2: {
              level3: {
                reference: 'top-level-id',
              },
            },
          },
        }).shape({
          id: enforce.isString(),
          level1: enforce.shape({
            level2: enforce.shape({
              level3: enforce.shape({
                reference: enforce.isString().matchesTopLevelId(),
              }),
            }),
          }),
        }),
      ).not.toThrow();
    });

    it('should fail when deeply nested value does not match', () => {
      expect(() =>
        enforce({
          id: 'top-level-id',
          level1: {
            level2: {
              level3: {
                reference: 'different-id',
              },
            },
          },
        }).shape({
          id: enforce.isString(),
          level1: enforce.shape({
            level2: enforce.shape({
              level3: enforce.shape({
                reference: enforce.isString().matchesTopLevelId(),
              }),
            }),
          }),
        }),
      ).toThrow();
    });
  });

  describe('Context with custom error messages', () => {
    beforeEach(() => {
      enforce.extend({
        notSameAsSibling: (value: string, siblingKey: string) => {
          const context = enforce.context();
          const parent = context?.parent();
          const siblingValue = parent?.value[siblingKey];

          if (value === siblingValue) {
            return {
              pass: false,
              message: () =>
                `Value "${value}" cannot be the same as ${siblingKey}`,
            };
          }

          return true;
        },
      });
    });

    it('should provide custom error message with context info', () => {
      expect(() =>
        enforce({
          password: 'secret',
          username: 'different',
        }).shape({
          password: enforce.isString(),
          username: enforce.isString().notSameAsSibling('password'),
        }),
      ).not.toThrow();
    });

    it('should show custom error when values match', () => {
      expect(() =>
        enforce({
          password: 'same',
          username: 'same',
        }).shape({
          password: enforce.isString(),
          username: enforce.isString().notSameAsSibling('password'),
        }),
      ).toThrow('Value "same" cannot be the same as password');
    });
  });

  describe('Context in array validation scenarios', () => {
    beforeEach(() => {
      enforce.extend({
        uniqueInArray: (value: any) => {
          const context = enforce.context();
          const parent = context?.parent();
          const array = parent?.value;

          if (!Array.isArray(array)) return true;

          const occurrences = array.filter(
            (item: any) => item === value,
          ).length;
          return occurrences === 1;
        },
      });
    });

    it('should validate uniqueness within array using context', () => {
      expect(() =>
        enforce({
          tags: ['javascript', 'typescript', 'node'],
        }).shape({
          tags: enforce.isArrayOf(enforce.isString().uniqueInArray()),
        }),
      ).not.toThrow();
    });

    it('should fail when array has duplicates', () => {
      expect(() =>
        enforce({
          tags: ['javascript', 'typescript', 'javascript'],
        }).shape({
          tags: enforce.isArrayOf(enforce.isString().uniqueInArray()),
        }),
      ).toThrow();
    });
  });

  describe('Context with password confirmation pattern', () => {
    beforeEach(() => {
      enforce.extend({
        passwordsMatch: (passConfirm: string) => {
          const context = enforce.context();
          const parent = context?.parent();
          const password = parent?.value.password;

          return passConfirm === password;
        },
      });
    });

    it('should validate password confirmation matches password', () => {
      expect(() =>
        enforce({
          password: 'SecurePass123',
          confirmPassword: 'SecurePass123',
        }).shape({
          password: enforce.isString(),
          confirmPassword: enforce.isString().passwordsMatch(),
        }),
      ).not.toThrow();
    });

    it('should fail when passwords do not match', () => {
      expect(() =>
        enforce({
          password: 'SecurePass123',
          confirmPassword: 'Different123',
        }).shape({
          password: enforce.isString(),
          confirmPassword: enforce.isString().passwordsMatch(),
        }),
      ).toThrow();
    });

    // Context is not available in lazy mode
    it('should work in lazy mode', () => {
      const schema = enforce.shape({
        password: enforce.isString(),
        confirmPassword: enforce.isString().passwordsMatch(),
      });

      expect(
        schema.run({
          password: 'SecurePass123',
          confirmPassword: 'SecurePass123',
        }).pass,
      ).toBe(true);

      expect(
        schema.run({
          password: 'SecurePass123',
          confirmPassword: 'Different123',
        }).pass,
      ).toBe(false);
    });
  });

  describe('Context at top level (no parent)', () => {
    beforeEach(() => {
      enforce.extend({
        checkParentIsNull: () => {
          const context = enforce.context();
          const parent = context?.parent();
          // At top level, parent should return null
          return parent === null;
        },
      });
    });

    it('should return null when calling parent at top level', () => {
      // This test verifies the documentation statement:
      // "When no levels left, parent will return null"
      expect(() => enforce('test').checkParentIsNull()).not.toThrow();
    });
  });

  describe('Context with conditional validation', () => {
    beforeEach(() => {
      enforce.extend({
        requiredIfOtherFieldPresent: (value: any, otherField: string) => {
          const context = enforce.context();
          const parent = context?.parent();
          const otherFieldValue = parent?.value[otherField];

          // If other field is present, this field is required
          if (otherFieldValue !== undefined && otherFieldValue !== null) {
            return value !== undefined && value !== null && value !== '';
          }

          return true;
        },
      });
    });

    it('should require field when other field is present', () => {
      expect(() =>
        enforce({
          hasShipping: true,
          shippingAddress: '123 Main St',
        }).loose({
          hasShipping: enforce.isBoolean(),
          shippingAddress: enforce
            .isString()
            .requiredIfOtherFieldPresent('hasShipping'),
        }),
      ).not.toThrow();
    });

    it('should not require field when other field is absent', () => {
      expect(() =>
        enforce({
          hasShipping: false,
        }).loose({
          hasShipping: enforce.optional(enforce.isBoolean()),
          shippingAddress: enforce
            .optional(enforce.isString())
            .requiredIfOtherFieldPresent('i_am_missing'),
        }),
      ).not.toThrow();
    });
  });

  describe('Real-world form validation scenarios', () => {
    beforeEach(() => {
      enforce.extend({
        differentFromUsername: (value: string) => {
          const context = enforce.context();
          const parent = context?.parent();
          return value !== parent?.value.username;
        },
        minAgeIfCountry: (value: number, country: string, minAge: number) => {
          const context = enforce.context();
          const parent = context?.parent();
          if (parent?.value.country === country) {
            return value >= minAge;
          }
          return true;
        },
      });
    });

    it('should validate user registration form', () => {
      expect(() =>
        enforce({
          username: 'johndoe',
          email: 'john@example.com',
          displayName: 'John Doe',
        }).shape({
          username: enforce.isString().longerThan(3),
          email: enforce.isString().matches(/@/),
          displayName: enforce.isString().differentFromUsername(),
        }),
      ).not.toThrow();
    });

    it('should validate age based on country context', () => {
      expect(() =>
        enforce({
          country: 'US',
          age: 21,
        }).shape({
          country: enforce.isString(),
          age: enforce.isNumber().minAgeIfCountry('US', 21),
        }),
      ).not.toThrow();
    });

    it('should fail age validation for specific country', () => {
      expect(() =>
        enforce({
          country: 'US',
          age: 18,
        }).shape({
          country: enforce.isString(),
          age: enforce.isNumber().minAgeIfCountry('US', 21),
        }),
      ).toThrow();
    });
  });

  describe('Context with loose schema', () => {
    beforeEach(() => {
      enforce.extend({
        matchesParentId: (value: string) => {
          const context = enforce.context();
          const parent = context?.parent();
          return value === parent?.value.id;
        },
      });
    });

    it('should work with loose schema allowing extra properties', () => {
      expect(() =>
        enforce({
          id: '123',
          reference: '123',
          extra: 'field',
        }).loose({
          id: enforce.isString(),
          reference: enforce.isString().matchesParentId(),
        }),
      ).not.toThrow();
    });
  });

  describe('Edge cases and error handling', () => {
    beforeEach(() => {
      enforce.extend({
        safeParentAccess: () => {
          const context = enforce.context();
          // Try to access parent safely
          try {
            const parent = context?.parent();
            return parent !== undefined;
          } catch (e) {
            return false;
          }
        },
      });
    });

    it('should handle safe parent access', () => {
      expect(() =>
        enforce({
          nested: {
            value: 'test',
          },
        }).shape({
          nested: enforce.shape({
            value: enforce.isString().safeParentAccess(),
          }),
        }),
      ).not.toThrow();
    });
  });

  describe('Integration with other schema rules', () => {
    beforeEach(() => {
      enforce.extend({
        arrayLengthMatchesCount: (value: any[]) => {
          const context = enforce.context();
          const parent = context?.parent();
          const count = parent?.value.count;
          return value.length === count;
        },
      });
    });

    it('should validate array length based on sibling property', () => {
      expect(() =>
        enforce({
          count: 3,
          items: ['a', 'b', 'c'],
        }).shape({
          count: enforce.isNumber(),
          items: enforce
            .isArrayOf(enforce.isString())
            .arrayLengthMatchesCount(),
        }),
      ).not.toThrow();
    });

    it('should fail when array length does not match count', () => {
      expect(() =>
        enforce({
          count: 2,
          items: ['a', 'b', 'c'],
        }).shape({
          count: enforce.isNumber(),
          items: enforce
            .isArrayOf(enforce.isString())
            .arrayLengthMatchesCount(),
        }),
      ).toThrow();
    });
  });
});
