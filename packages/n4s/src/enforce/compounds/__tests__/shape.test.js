import faker from 'faker';

import enforce from 'enforce';
import shape from 'shape';

describe('Shape validation', () => {
  describe('Base behavior', () => {
    it('Should fail when encountered a mis-shapen property', () => {
      expect(
        shape(
          { name: 99 },
          {
            name: enforce.isString(),
          }
        )
      ).toBe(false);
      expect(
        shape(
          { count: 500 },
          {
            count: enforce.isBetween(10, 20),
          }
        )
      ).toBe(false);
      expect(
        shape(
          { count: 500, isOnline: true },
          {
            count: enforce.equals(500),
            isOnline: enforce.equals(false),
          }
        )
      ).toBe(false);
    });

    it('Should pass when no mis-shapen property', () => {
      expect(
        shape(
          { name: '99' },
          {
            name: enforce.isString(),
          }
        )
      ).toBe(true);
      expect(
        shape(
          { count: 500 },
          {
            count: enforce.isBetween(400, 600),
          }
        )
      ).toBe(true);
      expect(
        shape(
          { count: 500, isOnline: true },
          {
            count: enforce.equals(500),
            isOnline: enforce.equals(true),
          }
        )
      ).toBe(true);
    });

    it('Allows array of enforcements per field', () => {
      expect(
        shape(
          {
            friendCount: 200,
          },
          {
            friendCount: [
              enforce.isNumber(),
              enforce.greaterThan(150),
              enforce.equals(200),
            ],
          }
        )
      ).toBe(true);
      expect(
        shape(
          {
            friendCount: 200,
          },
          {
            friendCount: [
              enforce.isNumber(),
              enforce.greaterThan(150),
              enforce.equals(300),
            ],
          }
        )
      ).toBe(false);
    });
  });

  describe('shape nesting', () => {
    it('Should allow deeply nested shape calls', () => {
      expect(
        shape(
          {
            user: {
              id: '000',
              details: {
                age: 99,
                name: {
                  first: 'John',
                  last: 'Doe',
                },
              },
            },
          },
          {
            user: enforce.shape({
              id: enforce.equals('000'),
              details: enforce.shape({
                age: enforce.isNumber(),
                name: enforce.shape({
                  first: enforce.isString(),
                  last: enforce.isString(),
                }),
              }),
            }),
          }
        )
      ).toBe(true);
      expect(
        shape(
          {
            user: {
              id: '000',
              details: {
                age: 99,
                name: {
                  first: 'John',
                  last: null,
                },
              },
            },
          },
          {
            user: enforce.shape({
              id: enforce.equals('000'),
              details: enforce.shape({
                age: enforce.isNumber(),
                name: enforce.shape({
                  first: enforce.isString(),
                  last: enforce.isString(),
                }),
              }),
            }),
          }
        )
      ).toBe(false);
    });
  });

  describe('When field is in data but not in shape', () => {
    it('Should fail', () => {
      expect(
        shape(
          { user: 'example', password: 'x123' },
          { user: enforce.isString(), password: enforce.endsWith('23') }
        )
      ).toBe(true);
      expect(
        shape(
          { user: 'example', password: 'x123' },
          { user: enforce.isString() }
        )
      ).toBe(false);
    });
  });

  describe('When field is in shape but not in data', () => {
    it('Should fail', () => {
      expect(
        shape(
          { user: 'example' },
          { user: enforce.isString(), password: enforce.startsWith('x') }
        )
      ).toBe(false);
    });
  });

  describe('Handling of optional fields', () => {
    it('Should allow optional fields to not be defined', () => {
      expect(
        shape(
          { user: 'example', confirm: 'example' },
          {
            user: enforce.isString(),
            password: enforce.optional(),
            confirm: enforce.optional(),
          }
        )
      ).toBe(true);
    });

    it('Should allow optional fields to be undefined', () => {
      expect(
        shape(
          { user: 'example', confirm: undefined },
          {
            user: enforce.isString(),
            confirm: enforce.optional(),
          }
        )
      ).toBe(true);
    });
    it('Should allow optional fields to be null', () => {
      expect(
        shape(
          { user: 'example', confirm: null },
          {
            user: enforce.isString(),
            confirm: enforce.optional(),
          }
        )
      ).toBe(true);
    });

    it('enforces rules on optional when value is defined', () => {
      expect(
        shape(
          { user: 'example', nickname: '1111' },
          {
            user: enforce.isString(),
            nickname: enforce.optional(
              enforce.isString(),
              enforce.isNotNumeric()
            ),
          }
        )
      ).toBe(false);
    });
  });

  describe('As part of enforce', () => {
    it('Should validate object shape correctly', () => {
      enforce({
        user: {
          age: faker.random.number(10),
          friends: [1, 2, 3, 4, 5],
          id: faker.random.uuid(),
          name: {
            first: faker.name.firstName(),
            last: faker.name.lastName(),
          },
          username: faker.internet.userName(),
        },
      }).shape(shapeRules());

      enforce({
        user: {
          age: faker.random.number(5),
          id: faker.random.uuid(),
          name: {
            first: faker.name.firstName(),
            middle: 'some name',
            last: faker.name.lastName(),
          },
          username: faker.internet.userName(),
        },
      }).shape(shapeRules());

      expect(() =>
        enforce({
          user: {
            age: 55, // 55 is not between 0-10
            id: faker.random.uuid(),
            name: {
              first: faker.name.firstName(),
              middle: 'some name',
              last: faker.name.lastName(),
            },
            username: faker.internet.userName(),
          },
        }).shape(shapeRules())
      ).toThrow();

      expect(() =>
        enforce({
          user: {
            age: 5,
            id: faker.random.uuid(),
            name: {
              first: faker.name.firstName(),
              middle: 'some name',
              last: faker.name.lastName(),
            },
            username: [1, 2, 3], // array instead of a string
          },
        }).shape(shapeRules())
      ).toThrow();

      expect(() =>
        enforce({
          user: {
            age: 5,
            id: faker.random.uuid(),
            username: 'example',
          },
        }).shape(shapeRules())
      ).toThrow();
    });
  });
});

const shapeRules = () => ({
  user: enforce.shape({
    age: [enforce.isNumber(), enforce.isBetween(0, 10)],
    friends: enforce.optional(enforce.isArray()),
    id: enforce.isString(),
    name: enforce.shape({
      first: enforce.isString(),
      last: enforce.isString(),
      middle: enforce.optional(enforce.isString()),
    }),
    username: enforce.isString(),
  }),
});
