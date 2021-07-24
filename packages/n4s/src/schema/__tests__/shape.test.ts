import enforce from 'enforce';

// The base behavior of 'loose' and 'shape' is practically the same
// so we cover them using the same tests.
describe.each(['loose', 'shape'])('enforce.%s', (methodName: string) => {
  describe('lazy interface', () => {
    it('Should return a passing return when tests are valid', () => {
      expect(
        enforce[methodName]({
          username: enforce.isString(),
          age: enforce.isNumber().gt(18),
        }).run({ username: 'ealush', age: 31 })
      ).toEqual({ pass: true });
    });

    it('Should return a failing return when tests are invalid', () => {
      expect(
        enforce[methodName]({
          username: enforce.isString(),
          age: enforce.isNumber().gt(18),
        }).run({ username: null, age: 0 })
      ).toEqual({ pass: false });
    });

    describe('nested shapes', () => {
      it('Should return a passing return when tests are valid', () => {
        expect(
          enforce[methodName]({
            username: enforce.isString(),
            age: enforce.isNumber().gt(18),
            address: enforce.shape({
              street: enforce.isString(),
              city: enforce.isString(),
              state: enforce.isString(),
              zip: enforce.isNumber(),
            }),
          }).run({
            username: 'ealush',
            age: 31,
            address: {
              street: '123 Main St',
              city: 'New York',
              state: 'NY',
              zip: 12345,
            },
          })
        ).toEqual({ pass: true });
      });
      it('Should return a failing return when tests are invalid', () => {
        expect(
          enforce[methodName]({
            username: enforce.isString(),
            age: enforce.isNumber().gt(18),
            address: enforce.shape({
              street: enforce.isString(),
              city: enforce.isString(),
              state: enforce.isString(),
              zip: enforce.isNumber(),
            }),
          }).run({
            username: 'ealush',
            age: 31,
            address: {
              street: '123 Main St',
              city: null,
            },
          })
        ).toEqual({ pass: false });
      });
    });
  });

  describe('eager interface', () => {
    it('Should throw an error fora failing return', () => {
      expect(() => {
        enforce({ username: null, age: 0 })[methodName]({
          username: enforce.isString(),
          age: enforce.isNumber().gt(18),
        });
      }).toThrow();
    });

    it('Should return silently for a passing return', () => {
      enforce({ username: 'ealush', age: 31 })[methodName]({
        username: enforce.isString(),
        age: enforce.isNumber().gt(18),
      });
    });

    describe('nested shapes', () => {
      it('Should return silently when tests are valid', () => {
        enforce({
          username: 'ealush',
          age: 31,
          address: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            zip: 12345,
          },
        })[methodName]({
          username: enforce.isString(),
          age: enforce.isNumber().gt(18),
          address: enforce.shape({
            street: enforce.isString(),
            city: enforce.isString(),
            state: enforce.isString(),
            zip: enforce.isNumber(),
          }),
        });
      });
      it('Should throw when tests are invalid', () => {
        expect(() => {
          enforce({
            username: 'ealush',
            age: 31,
            address: {
              street: '123 Main St',
              city: null,
            },
          })[methodName]({
            username: enforce.isString(),
            age: enforce.isNumber().gt(18),
            address: enforce.shape({
              street: enforce.isString(),
              city: enforce.isString(),
              state: enforce.isString(),
              zip: enforce.isNumber(),
            }),
          });
        }).toThrow();
      });
    });
  });
});

describe('enforce.shape excact matching', () => {
  describe('lazy interface', () => {
    it('Should return a failing return when value has non-enforced keys', () => {
      expect(
        enforce
          .shape({ username: enforce.isString(), age: enforce.isNumber() })
          .run({ username: 'ealush', age: 31, foo: 'bar' })
      ).toEqual({ pass: false });
    });
  });
  describe('eager interface', () => {
    it('Should throw an error when value has non-enforced keys', () => {
      expect(() => {
        enforce({ username: 'ealush', age: 31, foo: 'bar' }).shape({
          username: enforce.isString(),
          age: enforce.isNumber(),
        });
      }).toThrow();
    });
  });
});

describe('enforce.loose for loose matching', () => {
  describe('lazy interface', () => {
    it('Should return a passing return when value has non-enforced keys', () => {
      expect(
        enforce
          .loose({ username: enforce.isString(), age: enforce.isNumber() })
          .run({ username: 'ealush', age: 31, foo: 'bar' })
      ).toEqual({ pass: true });
    });
  });
  describe('eager interface', () => {
    it('Should return sliently return when value has non-enforced keys', () => {
      enforce({ username: 'ealush', age: 31, foo: 'bar' }).loose({
        username: enforce.isString(),
        age: enforce.isNumber(),
      });
    });
  });
});
