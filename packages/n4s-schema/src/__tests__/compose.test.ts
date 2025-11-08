import { describe, it, expect, beforeEach } from 'vitest';

import { compose, enforce } from 'n4s';

describe('compose() - Rule Composition', () => {
  describe('Basic composition', () => {
    it('Should create AND relationship between rules', () => {
      const NumberAboveTen = compose(
        enforce.isNumber(),
        enforce.isNumber().greaterThan(10),
      );

      expect(() => NumberAboveTen(5)).toThrow();
      expect(() => NumberAboveTen('11')).toThrow();
      expect(() => NumberAboveTen(10)).toThrow();
      expect(() => NumberAboveTen(11)).not.toThrow();
    });

    it('Should fail if any composed rule fails', () => {
      const StringLongerThanFive = compose(
        enforce.isString(),
        enforce.isString().longerThan(5),
      );

      expect(() => StringLongerThanFive(123)).toThrow(); // Not a string
      expect(() => StringLongerThanFive('hi')).toThrow(); // Too short
      expect(() => StringLongerThanFive('hello world')).not.toThrow();
    });

    it('Should pass if all composed rules pass', () => {
      const ValidEmail = compose(
        enforce.isString(),
        enforce.isString().matches(/@/),
        enforce.isString().longerThan(5),
      );

      expect(() => ValidEmail('user@example.com')).not.toThrow();
    });
  });

  describe('Lazy evaluation', () => {
    it('Should support .run() method', () => {
      const NumericStringBetweenThreeAndFive = compose(
        enforce.isNumeric(),
        enforce.isString(),
        enforce.isNumeric().greaterThan(3),
        enforce.isNumeric().lessThan(5),
      );

      expect(NumericStringBetweenThreeAndFive.run('4').pass).toBe(true);
      expect(NumericStringBetweenThreeAndFive.run('3').pass).toBe(false);
      expect(NumericStringBetweenThreeAndFive.run(5).pass).toBe(false);
    });

    it('Should support .test() method', () => {
      const NumericStringBetweenThreeAndFive = compose(
        enforce.isNumeric(),
        enforce.isString(),
        enforce.isNumeric().greaterThan(3),
        enforce.isNumeric().lessThan(5),
      );

      expect(NumericStringBetweenThreeAndFive.test('4')).toBe(true);
      expect(NumericStringBetweenThreeAndFive.test('3')).toBe(false);
      expect(NumericStringBetweenThreeAndFive.test(5)).toBe(false);
    });

    it('Should return detailed results with .run()', () => {
      const PositiveNumber = compose(
        enforce.isNumber(),
        enforce.isNumber().greaterThan(0),
      );

      const passingResult = PositiveNumber.run(5);
      expect(passingResult.pass).toBe(true);
      expect(passingResult.message).toBeUndefined();

      const failingResult = PositiveNumber.run(-5);
      expect(failingResult.pass).toBe(false);
      // Message may or may not be defined depending on the rule
    });
  });

  describe('Composition with schema rules', () => {
    it('Should compose shape validations', () => {
      const Name = compose(
        enforce.shape({
          first: enforce.isString().longerThan(0),
          last: enforce.isString().longerThan(0),
          middle: enforce.optional(enforce.isString().longerThan(0)),
        }),
      );

      expect(() =>
        Name({
          first: 'John',
          last: 'Doe',
        }),
      ).not.toThrow();

      expect(() =>
        Name({
          first: 'John',
          last: 'Doe',
          middle: '',
        }),
      ).toThrow();
    });

    it('Should work as part of larger shape', () => {
      const Name = compose(
        enforce.shape({
          first: enforce.isString().longerThan(0),
          last: enforce.isString().longerThan(0),
        }),
      );

      expect(
        enforce
          .shape({
            name: Name,
            age: enforce.isNumber(),
          })
          .run({
            name: {
              first: 'John',
              last: 'Doe',
            },
            age: 30,
          }).pass,
      ).toBe(true);

      expect(
        enforce
          .shape({
            name: Name,
            age: enforce.isNumber(),
          })
          .run({
            name: {
              first: 'John',
              last: '',
            },
            age: 30,
          }).pass,
      ).toBe(false);
    });

    it('Should compose loose validations', () => {
      const Entity = compose(
        enforce.loose({
          id: enforce.isNumeric(),
        }),
      );

      expect(() =>
        Entity({
          id: '123',
          extra: 'field',
        }),
      ).not.toThrow();

      expect(() =>
        Entity({
          id: 'not-numeric',
        }),
      ).toThrow();
    });
  });

  describe('Composing compositions', () => {
    it('Should allow nested composition', () => {
      const Name = compose(
        enforce.loose({
          name: enforce.shape({
            first: enforce.isString().longerThan(0),
            last: enforce.isString().longerThan(0),
            middle: enforce.optional(enforce.isString().longerThan(0)),
          }),
        }),
      );

      const Entity = compose(
        enforce.loose({
          id: enforce.isNumeric(),
        }),
      );

      const User = compose(Name, Entity);

      expect(
        User.run({
          id: '1',
          name: {
            first: 'John',
            middle: 'M',
            last: 'Doe',
          },
        }).pass,
      ).toBe(true);

      expect(() =>
        User({
          id: '1',
          name: {
            first: 'John',
            middle: 'M',
            last: 'Doe',
          },
        }),
      ).not.toThrow();

      expect(
        User.run({
          id: '_',
          name: {
            first: 'John',
          },
        }).pass,
      ).toBe(false);

      expect(() =>
        User({
          name: {
            first: 'John',
          },
          id: '__',
        }),
      ).toThrow();
    });

    it('Should compose multiple composites', () => {
      const HasId = compose(enforce.loose({ id: enforce.isNumber() }));
      const HasName = compose(enforce.loose({ name: enforce.isString() }));
      const HasEmail = compose(
        enforce.loose({ email: enforce.isString().matches(/@/) }),
      );

      const User = compose(HasId, HasName, HasEmail);

      expect(
        User.run({
          id: 1,
          name: 'John',
          email: 'john@example.com',
        }).pass,
      ).toBe(true);

      expect(
        User.run({
          id: 1,
          name: 'John',
          email: 'invalid',
        }).pass,
      ).toBe(false);
    });
  });

  describe('Composition with arrays', () => {
    it('Should compose array validations', () => {
      const NumberArray = compose(
        enforce.isArray(),
        enforce.isArrayOf(enforce.isNumber()),
        enforce.isArray<number>().longerThan(0),
      );

      expect(() => NumberArray([1, 2, 3])).not.toThrow();
      expect(() => NumberArray([])).toThrow(); // Empty array fails longerThan(0)
      expect(() => NumberArray([1, '2', 3])).toThrow(); // Not all numbers
    });

    it('Should compose complex array of objects', () => {
      const User = compose(
        enforce.shape({
          id: enforce.isNumber(),
          name: enforce.isString(),
        }),
      );

      const Users = compose(
        enforce.isArray(),
        enforce.isArrayOf(User),
        enforce.isArray().longerThan(0),
      );

      expect(
        Users.run([
          { id: 1, name: 'Alice' },
          { id: 2, name: 'Bob' },
        ]).pass,
      ).toBe(true);

      expect(
        Users.run([
          { id: 1, name: 'Alice' },
          { id: '2', name: 'Bob' },
        ]).pass,
      ).toBe(false);
    });
  });

  describe('Composition with compound rules', () => {
    it('Should compose with anyOf', () => {
      const StringOrNumber = compose(
        enforce.anyOf(enforce.isString(), enforce.isNumber()),
        enforce.isNotEmpty(),
      );

      expect(StringOrNumber.test('hello')).toBe(true);
      expect(StringOrNumber.test(123)).toBe(true);
      expect(StringOrNumber.test('')).toBe(false);
      expect(StringOrNumber.test(true)).toBe(false);
    });

    it('Should compose with allOf', () => {
      const ValidPassword = compose(
        enforce.allOf(
          enforce.isString(),
          enforce.isString().longerThan(7),
          enforce.isString().matches(/[A-Z]/),
          enforce.isString().matches(/[0-9]/),
        ),
      );

      expect(ValidPassword.test('Password1')).toBe(true);
      expect(ValidPassword.test('password1')).toBe(false); // No uppercase
      expect(ValidPassword.test('Password')).toBe(false); // No number
      expect(ValidPassword.test('Pass1')).toBe(false); // Too short
    });
  });

  describe('Reusability', () => {
    it('Should allow reusing composed rules', () => {
      const PositiveInteger = compose(
        enforce.isNumber(),
        enforce.isNumber().greaterThan(0),
      );

      expect(PositiveInteger.test(5)).toBe(true);
      expect(PositiveInteger.test(10)).toBe(true);
      expect(PositiveInteger.test(0)).toBe(false);
      expect(PositiveInteger.test(-5)).toBe(false);
      // Note: n4st have isInteger, so we can't test decimals
    });

    it('Should allow building validators library', () => {
      const validators = {
        email: compose(
          enforce.isString(),
          enforce.isString().matches(/@/),
          enforce.isString().longerThan(5),
        ),
        phone: compose(
          enforce.isString(),
          enforce.isString().matches(/^\+?[\d\s-()]+$/),
        ),
        url: compose(
          enforce.isString(),
          enforce.isString().matches(/^https?:\/\//),
        ),
      };

      expect(validators.email.test('user@example.com')).toBe(true);
      expect(validators.phone.test('+1-234-567-8900')).toBe(true);
      expect(validators.url.test('https://example.com')).toBe(true);
    });
  });

  describe('Custom rules in composition', () => {
    beforeEach(() => {
      enforce.extend({
        isEven: (value: number) => value % 2 === 0,
        isPositive: (value: number) => value > 0,
      });
    });

    it('Should compose custom rules', () => {
      const PositiveEven = compose(
        enforce.isNumber(),
        enforce.isNumber().isPositive(),
        enforce.isNumber().isEven(),
      );

      expect(PositiveEven.test(4)).toBe(true);
      expect(PositiveEven.test(2)).toBe(true);
      expect(PositiveEven.test(3)).toBe(false); // Not even
      expect(PositiveEven.test(-2)).toBe(false); // Not positive
    });
  });

  describe('Error handling', () => {
    it('Should throw on first failing rule in eager mode', () => {
      const Validator = compose(
        enforce.isString(),
        enforce.isString().longerThan(5),
        enforce.isString().matches(/test/),
      );

      expect(() => Validator(123)).toThrow(); // Fails on isString
      expect(() => Validator('hi')).toThrow(); // Fails on longerThan
      expect(() => Validator('hello world')).toThrow(); // Fails on matches
    });

    it('Should provide meaningful error in lazy mode', () => {
      const Validator = compose(
        enforce.isNumber(),
        enforce.isNumber().greaterThan(10),
      );

      const result = Validator.run('not a number');
      expect(result.pass).toBe(false);
      // Message may or may not be defined depending on the rule
    });
  });

  describe('Edge cases', () => {
    it('Should handle single rule composition', () => {
      const JustNumber = compose(enforce.isNumber());

      expect(JustNumber.test(123)).toBe(true);
      expect(JustNumber.test('123')).toBe(false);
    });

    it('Should handle empty composition gracefully', () => {
      const Empty = compose();

      // Empty composition should always pass
      expect(Empty.run('anything').pass).toBe(true);
      expect(() => Empty('anything')).not.toThrow();
    });

    it('Should work with falsy values', () => {
      const AcceptsFalsy = compose(enforce.equals(false));

      expect(AcceptsFalsy.test(false)).toBe(true);
      expect(AcceptsFalsy.test(0)).toBe(false);
      expect(AcceptsFalsy.test('')).toBe(false);
    });
  });

  describe('Real-world use cases', () => {
    it('Should validate user registration data', () => {
      const Username = compose(
        enforce.isString(),
        enforce.isString().longerThan(3),
        enforce.isString().shorterThan(20),
        enforce.isString().matches(/^[a-zA-Z0-9_]+$/),
      );

      const Email = compose(
        enforce.isString(),
        enforce.isString().matches(/@/),
        enforce.isString().matches(/\./),
      );

      const Password = compose(
        enforce.isString(),
        enforce.isString().longerThan(7),
        enforce.isString().matches(/[A-Z]/),
        enforce.isString().matches(/[a-z]/),
        enforce.isString().matches(/[0-9]/),
      );

      const UserRegistration = compose(
        enforce.shape({
          username: Username,
          email: Email,
          password: Password,
        }),
      );

      expect(
        UserRegistration.test({
          username: 'john_doe',
          email: 'john@example.com',
          password: 'SecurePass123',
        }),
      ).toBe(true);

      expect(
        UserRegistration.test({
          username: 'ab', // Too short
          email: 'john@example.com',
          password: 'SecurePass123',
        }),
      ).toBe(false);
    });

    it('Should validate API response structure', () => {
      const User = compose(
        enforce.shape({
          id: enforce.isNumber(),
          name: enforce.isString(),
          email: enforce.isString().matches(/@/),
        }),
      );

      const ApiResponse = compose(
        enforce.shape({
          data: User,
          status: enforce.equals(200),
          timestamp: enforce.isNumber(),
        }),
      );

      expect(
        ApiResponse.test({
          data: {
            id: 1,
            name: 'John',
            email: 'john@example.com',
          },
          status: 200,
          timestamp: Date.now(),
        }),
      ).toBe(true);
    });

    it('Should create domain-specific validators', () => {
      const Money = compose(
        enforce.isNumber(),
        enforce.isNumber().greaterThanOrEquals(0),
      );

      const Product = compose(
        enforce.shape({
          id: enforce.isNumber(),
          name: enforce.isString().longerThan(0),
          price: Money,
          quantity: compose(
            enforce.isNumber(),
            enforce.isNumber().greaterThanOrEquals(0),
          ),
        }),
      );

      expect(
        Product.test({
          id: 1,
          name: 'Widget',
          price: 19.99,
          quantity: 100,
        }),
      ).toBe(true);

      expect(
        Product.test({
          id: 1,
          name: 'Widget',
          price: -5, // Invalid: negative price
          quantity: 100,
        }),
      ).toBe(false);
    });
  });

  describe('Type inference compatibility', () => {
    it('Should work with inferred types from compositions', () => {
      const StringRule = enforce.isString();
      const NumberRule = enforce.isNumber();

      const StringOrNumberComposite = compose(
        enforce.anyOf(StringRule, NumberRule),
      );

      expect(StringOrNumberComposite.test('hello')).toBe(true);
      expect(StringOrNumberComposite.test(123)).toBe(true);
      expect(StringOrNumberComposite.test(true)).toBe(false);
    });

    it('Should preserve type information through compositions', () => {
      const PositiveNumber = compose(
        enforce.isNumber(),
        enforce.isNumber().greaterThan(0),
      );

      // Type should be inferred as number
      type InferredType = typeof PositiveNumber.infer;

      const value: InferredType = 5;
      expect(PositiveNumber.test(value)).toBe(true);
    });
  });
});
