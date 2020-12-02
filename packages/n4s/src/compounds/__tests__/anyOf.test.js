import enforce from 'enforce';

describe('AnyOf validation', () => {
  describe('Base behavior', () => {
    it('Should fail when all rules fail', () => {
      expect(
        enforce.anyOf(enforce.isNumber(), enforce.isUndefined())
      ).not.toPassWith('test');

      expect(
        enforce.anyOf(enforce.isNumber(), enforce.isUndefined())
      ).not.toPassWith('test');
    });
    it('Should succeed when at least one rule applies', () => {
      expect(
        enforce.anyOf(
          enforce.isString(),
          enforce.isNumber(),
          enforce.isUndefined()
        )
      ).toPassWith(5);
    });
    it('Should succeed when rule chaining', () => {
      expect(
        enforce.anyOf(
          enforce.isArray().isNotEmpty().longerThan(2),
          enforce.isUndefined()
        )
      ).toPassWith([1, 2, 3]);
    });
    it('Should fail with no rules', () => {
      expect(enforce.anyOf()).not.toPassWith();
    });
  });
  describe('As part of enforce', () => {
    it('Should validate anyof the rules correctly', () => {
      enforce(77).anyOf(
        enforce.isString(),
        enforce.isNumber(),
        enforce.isUndefined()
      );
      expect(() =>
        enforce({ test: 4 }).anyOf(enforce.isNumber(), enforce.isUndefined())
      ).toThrow();
    });
  });
});
