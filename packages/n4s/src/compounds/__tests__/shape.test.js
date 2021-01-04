import faker from 'faker';

import enforce from 'enforce';

describe('Shape validation', () => {
  describe('Base behavior', () => {
    it('Should fail when encountered a mis-shapen property', () => {
      expect(
        enforce.shape({
          name: enforce.isString(),
        })
      ).not.toPassWith({ name: 99 });
      expect(
        enforce.shape({
          count: enforce.isBetween(10, 20),
        })
      ).not.toPassWith({ count: 500 });
      expect(
        enforce.shape({
          count: enforce.equals(500),
          isOnline: enforce.equals(false),
        })
      ).not.toPassWith({ count: 500, isOnline: true });
    });

    it('Should pass when no mis-shapen property', () => {
      expect(
        enforce.shape({
          name: enforce.isString(),
        })
      ).toPassWith({ name: '99' });
      expect(
        enforce.shape({
          count: enforce.isBetween(400, 600),
        })
      ).toPassWith({ count: 500 });
      expect(
        enforce.shape({
          count: enforce.equals(500),
          isOnline: enforce.equals(true),
        })
      ).toPassWith({ count: 500, isOnline: true });
    });

    it('Allows multiple enforcements per field', () => {
      expect(
        enforce.shape({
          friendCount: enforce.isNumber().greaterThan(150).equals(200),
        })
      ).toPassWith({
        friendCount: 200,
      });
      expect(
        enforce.shape({
          friendCount: enforce.isNumber().greaterThan(150).equals(300),
        })
      ).not.toPassWith({
        friendCount: 200,
      });
    });
  });

  describe('shape nesting', () => {
    it('Should allow deeply nested shape calls', () => {
      expect(
        enforce.shape({
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
        })
      ).toPassWith({
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
      });
      expect(
        enforce.shape({
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
        })
      ).not.toPassWith({
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
      });
    });
  });

  describe('When field is in data but not in shape', () => {
    it('Should fail', () => {
      expect(
        enforce.shape({
          user: enforce.isString(),
          password: enforce.endsWith('23'),
        })
      ).toPassWith({ user: 'example', password: 'x123' });
      expect(enforce.shape({ user: enforce.isString() })).not.toPassWith({
        user: 'example',
        password: 'x123',
      });
    });
  });

  describe('When field is in data but not in shape with loose option', () => {
    it('Should succeed', () => {
      expect(
        enforce.shape(
          { user: enforce.isString(), password: enforce.endsWith('23') },
          { loose: true }
        )
      ).toPassWith({ user: 'example', password: 'x123' });
      expect(
        enforce.shape({ user: enforce.isString() }, { loose: true })
      ).toPassWith({ user: 'example', password: 'x123' });
    });
  });

  describe('When field is in shape but not in data', () => {
    it('Should fail', () => {
      expect(
        enforce.shape({
          user: enforce.isString(),
          password: enforce.startsWith('x'),
        })
      ).not.toPassWith({ user: 'example' });
    });
    it('Should fail even with loose', () => {
      expect(
        enforce.shape(
          { user: enforce.isString(), password: enforce.startsWith('x') },
          { loose: true }
        )
      ).not.toPassWith({ user: 'example' });
    });
  });

  describe('Behavior of loose compared to shape', () => {
    it('Should succeed', () => {
      expect(
        enforce.loose({
          user: enforce.isString(),
          password: enforce.endsWith('23'),
        })
      ).toPassWith({ user: 'example', password: 'x123' });
      expect(enforce.loose({ user: enforce.isString() })).toPassWith({
        user: 'example',
        password: 'x123',
      });
    });
    it('Should fail even with loose', () => {
      expect(
        enforce.loose({
          user: enforce.isString(),
          password: enforce.startsWith('x'),
        })
      ).not.toPassWith({ user: 'example' });
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

      expect(() =>
        enforce({
          user: {
            age: faker.random.number(10),
            friends: [1, 2, 3, 4, 5],
            id: faker.random.uuid(),
            name: {
              first: faker.name.firstName(),
              last: faker.name.lastName(),
            },
            shoeSize: 3,
            username: faker.internet.userName(),
          },
        }).shape(shapeRules())
      ).toThrow();

      enforce({
        user: {
          age: faker.random.number(10),
          friends: [1, 2, 3, 4, 5],
          id: faker.random.uuid(),
          name: {
            first: faker.name.firstName(),
            last: faker.name.lastName(),
          },
          shoeSize: 3,
          username: faker.internet.userName(),
        },
      }).loose(looseRules());
    });
  });
});

const looseRules = () => ({
  user: enforce.loose({
    age: enforce.isNumber().isBetween(0, 10),
    friends: enforce.optional(enforce.isArray()),
    id: enforce.isString(),
    name: enforce.loose({
      first: enforce.isString(),
      last: enforce.isString(),
      middle: enforce.optional(enforce.isString()),
    }),
    username: enforce.isString(),
  }),
});
const shapeRules = () => ({
  user: enforce.shape({
    age: enforce.isNumber().isBetween(0, 10),
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
