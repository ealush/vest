import enforce from 'enforce';
import * as ruleReturn from 'ruleReturn';

describe('enforce.shape excact matching', () => {
  describe('lazy interface', () => {
    it('Should return a failing return when value has non-enforced keys', () => {
      expect(
        enforce
          .shape({ username: enforce.isString(), age: enforce.isNumber() })
          .run({ username: 'ealush', age: 31, foo: 'bar' })
      ).toEqual(ruleReturn.failing());
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
