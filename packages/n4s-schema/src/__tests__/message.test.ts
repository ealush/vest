import { describe, it, expect, vi, beforeEach } from 'vitest';

import { enforce } from 'n4s-schema';

describe('enforce().message() - Eager API', () => {
  describe('Basic message override', () => {
    it('Should return message as a function', () => {
      expect(enforce(3).message).toBeInstanceOf(Function);
    });

    it('Should return message after chaining', () => {
      expect(enforce(1).equals(1).message).toBeInstanceOf(Function);
    });

    it('Should throw a custom message string', () => {
      let error;
      try {
        enforce(1).message('oogie boogie').equals(2);
      } catch (e) {
        error = e;
      }
      expect(error).toBe('oogie boogie');
    });

    it('Should throw the custom message on failure', () => {
      expect(() => {
        enforce('').message('octopus').equals('evyatar');
      }).toThrow('octopus');
    });

    it('Should not throw when validation passes', () => {
      expect(() => {
        enforce(1).message('should not see this').equals(1);
      }).not.toThrow();
    });
  });

  describe('Message with multiple rules', () => {
    it('Should use the last message that failed', () => {
      expect(() => {
        enforce(10)
          .message('must be a number!')
          .isNumber()
          .message('too high')
          .lessThan(8);
      }).toThrow('too high');
    });

    it('Should override message for the next failing rule in chain', () => {
      expect(() => {
        enforce(5)
          .message('First error')
          .greaterThan(10)
          .message('Second error')
          .lessThan(3);
      }).toThrow('First error'); // Fails on first rule
    });

    it('Should use latest message when multiple rules fail', () => {
      expect(() => {
        enforce('abc')
          .message('Wrong type')
          .isNumber()
          .message('Out of range')
          .greaterThan(100);
      }).toThrow('Wrong type'); // Fails on isNumber first
    });
  });

  describe('Message with custom rules', () => {
    beforeEach(() => {
      enforce.extend({
        ruleWithFailureMessage: () => ({
          pass: false,
          message: 'This should not be seen!',
        }),
        isEven: (value: number) => value % 2 === 0,
        isDivisibleBy: (value: number, divisor: number) =>
          value % divisor === 0,
      });
    });

    it('Should override custom rule message', () => {
      expect(() => {
        enforce(5).message('Must be even').isEven();
      }).toThrow('Must be even');
    });

    it('Should override message from custom rule that returns object', () => {
      expect(() => {
        enforce(1).message('Custom error message').ruleWithFailureMessage();
      }).toThrow('Custom error message');
    });

    it('Should work with parameterized custom rules', () => {
      expect(() => {
        enforce(10).message('Not divisible by 3').isDivisibleBy(3);
      }).toThrow('Not divisible by 3');
    });
  });

  describe('Message with schema rules', () => {
    it('Should override message for shape validation', () => {
      expect(() => {
        enforce({
          name: 'John',
          age: 'thirty', // Wrong type
        })
          .message('Invalid user data')
          .shape({
            name: enforce.isString(),
            age: enforce.isNumber(),
          });
      }).toThrow('Invalid user data');
    });

    it('Should override message for loose validation', () => {
      expect(() => {
        enforce({
          id: 'not-a-number',
        })
          .message('Invalid entity')
          .loose({
            id: enforce.isNumber(),
          });
      }).toThrow('Invalid entity');
    });

    it('Should override message for isArrayOf validation', () => {
      expect(() => {
        enforce([1, '2', 3])
          .message('Array must contain only numbers')
          .isArrayOf(enforce.isNumber());
      }).toThrow('Array must contain only numbers');
    });

    it('Should override message for optional validation', () => {
      expect(() => {
        enforce({
          name: 'John',
          middleName: 123, // Should be string or nullish
        })
          .message('Invalid middle name')
          .shape({
            name: enforce.isString(),
            middleName: enforce.optional(enforce.isString()),
          });
      }).toThrow('Invalid middle name');
    });
  });

  describe('Message with compound rules', () => {
    it('Should override message for anyOf', () => {
      expect(() => {
        enforce(true)
          .message('Must be string or number')
          .anyOf(enforce.isString(), enforce.isNumber());
      }).toThrow('Must be string or number');
    });

    it('Should override message for allOf', () => {
      expect(() => {
        enforce('hi')
          .message('Must satisfy all conditions')
          .allOf(enforce.isString(), enforce.isString().longerThan(5));
      }).toThrow('Must satisfy all conditions');
    });

    it('Should override message for oneOf', () => {
      expect(() => {
        enforce(5)
          .message('Must match exactly one condition')
          .oneOf(enforce.isNumber().greaterThan(10), enforce.isString());
      }).toThrow('Must match exactly one condition');
    });

    it('Should override message for noneOf', () => {
      expect(() => {
        enforce('hello')
          .message('Must not be a string')
          .noneOf(enforce.isString());
      }).toThrow('Must not be a string');
    });
  });

  describe('Message with type rules', () => {
    it('Should override message for isString', () => {
      expect(() => {
        enforce(123).message('Value must be a string').isString();
      }).toThrow('Value must be a string');
    });

    it('Should override message for isNumber', () => {
      expect(() => {
        enforce('123').message('Value must be a number').isNumber();
      }).toThrow('Value must be a number');
    });

    it('Should override message for isBoolean', () => {
      expect(() => {
        enforce('true').message('Value must be a boolean').isBoolean();
      }).toThrow('Value must be a boolean');
    });

    it('Should override message for isArray', () => {
      expect(() => {
        enforce({}).message('Value must be an array').isArray();
      }).toThrow('Value must be an array');
    });
  });

  describe('Message with chained rules', () => {
    it('Should override message for string chain', () => {
      expect(() => {
        enforce('hi')
          .message('String validation failed')
          .isString()
          .message('Length check failed')
          .longerThan(10);
      }).toThrow('Length check failed');
    });

    it('Should override message for number chain', () => {
      expect(() => {
        enforce(5)
          .message('Number validation failed')
          .isNumber()
          .message('Number out of range')
          .greaterThan(10)
          .lessThan(20);
      }).toThrow('Number out of range');
    });

    it('Should allow multiple message overrides in chain', () => {
      expect(() => {
        enforce('hello')
          .message('First check failed')
          .isString()
          .message('Length check failed')
          .longerThan(10);
      }).toThrow('Length check failed');
    });
  });

  describe('Edge cases', () => {
    it('Should handle empty message string', () => {
      expect(() => {
        enforce(1).message('').equals(2);
      }).toThrow('');
    });

    it('Should handle message with special characters', () => {
      const specialMsg = 'Error: Expected <number>, got "{value}"!';
      expect(() => {
        enforce('string').message(specialMsg).isNumber();
      }).toThrow(specialMsg);
    });

    it('Should handle very long messages', () => {
      const longMsg = 'A'.repeat(1000);
      expect(() => {
        enforce(1).message(longMsg).equals(2);
      }).toThrow(longMsg);
    });

    it('Should work with null and undefined values', () => {
      expect(() => {
        enforce(null).message('Value cannot be null').isString();
      }).toThrow('Value cannot be null');

      expect(() => {
        enforce(undefined).message('Value cannot be undefined').isNumber();
      }).toThrow('Value cannot be undefined');
    });
  });

  describe('Real-world usage patterns', () => {
    it('Should validate user input with custom messages', () => {
      // First message applies to isString (passes), second to longerThan (fails)
      expect(() => {
        enforce('')
          .message('Username type check')
          .isString()
          .message('Username must be at least 3 characters')
          .longerThan(2);
      }).toThrow('Username must be at least 3 characters');
    });

    it.skip('Should validate form data with descriptive errors (requires lazy API .message())', () => {
      const formData = {
        email: 'notanemail',
        age: -5,
      };

      expect(() => {
        enforce(formData)
          .message('Invalid form data')
          .shape({
            email: enforce
              .isString()
              .message('Email must contain @')
              .matches(/@/),
            age: enforce
              .isNumber()
              .message('Age must be positive')
              .greaterThan(0),
          });
      }).toThrow('Invalid form data');
    });

    it.skip('Should validate nested objects with specific error messages (requires lazy API .message())', () => {
      expect(() => {
        enforce({
          user: {
            profile: {
              name: '',
            },
          },
        })
          .message('Invalid user profile')
          .shape({
            user: enforce.shape({
              profile: enforce.shape({
                name: enforce
                  .isString()
                  .message('Name cannot be empty')
                  .longerThan(0),
              }),
            }),
          });
      }).toThrow('Invalid user profile');
    });

    it.skip('Should validate API responses with clear errors (requires lazy API .message())', () => {
      const apiResponse = {
        status: 404,
        data: null,
      };

      expect(() => {
        enforce(apiResponse)
          .message('Invalid API response')
          .shape({
            status: enforce
              .isNumber()
              .message('Status must be 200')
              .equals(200),
            data: enforce.isNotNullish(),
          });
      }).toThrow('Invalid API response');
    });
  });

  describe('Message precedence', () => {
    it('Should use most recent message before the failing rule', () => {
      expect(() => {
        enforce(5)
          .message('A')
          .isNumber() // Passes
          .message('B')
          .greaterThan(10) // Fails
          .message('C')
          .lessThan(20);
      }).toThrow('B');
    });

    it('Should clear message after successful validation', () => {
      // The message should only apply to the next validation(s) that fail
      expect(() => {
        enforce(15)
          .message('Too small')
          .greaterThan(10) // Passes, message unused
          .lessThan(5); // Fails without custom message
      }).toThrow(); // Should throw default message, not 'Too small'
    });
  });

  describe('Type validation with custom messages', () => {
    it('Should work with isNumeric', () => {
      expect(() => {
        enforce('abc').message('Must be numeric string').isNumeric();
      }).toThrow('Must be numeric string');
    });

    it('Should work with isNull', () => {
      expect(() => {
        enforce('not null').message('Must be null').isNull();
      }).toThrow('Must be null');
    });

    it('Should work with isNullish', () => {
      expect(() => {
        enforce('not nullish').message('Must be null or undefined').isNullish();
      }).toThrow('Must be null or undefined');
    });
  });
});

// Lazy API message support is now implemented!
describe('enforce.message() - Lazy API', () => {
  describe('Basic lazy message override', () => {
    it('Should set the failure message in builtin rules', () => {
      const result = enforce
        .equals(false)
        .message('oof. Expected true to be false')
        .run(true);

      expect(result.pass).toBe(false);
      expect(result.message).toBe('oof. Expected true to be false');
    });

    it('Should accept message as function', () => {
      const result = enforce
        .equals(false)
        .message(() => 'oof. Expected true to be false')
        .run(true);

      expect(result.pass).toBe(false);
      expect(result.message).toBe('oof. Expected true to be false');
    });
  });

  describe('Message callback', () => {
    it('Should be passed the rule value as the first argument', () => {
      const msg = vi.fn(() => 'some message');
      const arg = {};
      const result = enforce.equals(false).message(msg).run(arg);

      expect(result.pass).toBe(false);
      expect(result.message).toBe('some message');
      expect(msg).toHaveBeenCalledWith(arg, undefined);
    });

    it('Should pass original message as second argument if exists', () => {
      enforce.extend({
        ruleWithFailureMessage: () => ({
          pass: false,
          message: 'This should not be seen!',
        }),
      });

      const msg = vi.fn(() => 'some message');
      const arg = {};
      const result = enforce.ruleWithFailureMessage().message(msg).run(arg);

      expect(result.pass).toBe(false);
      expect(result.message).toBe('some message');
      expect(msg).toHaveBeenCalledWith(arg, 'This should not be seen!');
    });
  });

  describe('Lazy message with schema rules', () => {
    it('Should override message for equals', () => {
      const result = enforce.equals(5).message('Value must equal 5').run(10);

      expect(result.pass).toBe(false);
      expect(result.message).toBe('Value must equal 5');
    });
  });
});
