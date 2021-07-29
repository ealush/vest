import enforce from 'enforce';
import * as ruleReturn from 'ruleReturn';

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
      ).toEqual(ruleReturn.passing());
    });

    it('Should return a failing return when tests are invalid', () => {
      expect(
        enforce[methodName]({
          username: enforce.isString(),
          age: enforce.isNumber().gt(18),
        }).run({ username: null, age: 0 })
      ).toEqual(ruleReturn.failing());
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
        ).toEqual(ruleReturn.passing());
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
        ).toEqual(ruleReturn.failing());
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
