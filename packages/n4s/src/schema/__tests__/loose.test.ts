import enforce from 'enforce';

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
