import enforce from 'enforce';

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