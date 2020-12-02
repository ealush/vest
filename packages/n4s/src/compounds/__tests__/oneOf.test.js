import enforce from 'enforce';

describe('OneOf validation', () => {
  describe('Base behavior', () => {
    it('Should fail when all rules fail', () => {
      expect(
        enforce.oneOf(enforce.isNumber(), enforce.isUndefined())
      ).not.toPassWith('test');
    });
    it('Should succeed when EXACTLY one rule applies', () => {
      expect(
        enforce.oneOf(
          enforce.isString(),
          enforce.isNumber(),
          enforce.isUndefined()
        )
      ).toPassWith(5);
    });
    it('Should fail when more than one rule applies', () => {
      expect(
        enforce.oneOf(enforce.isNumber(), enforce.isNumber().greaterThan(3))
      ).not.toPassWith(5);
    });
    it('Should succeed when rule chaining', () => {
      expect(
        enforce.oneOf(
          enforce.isArray().isNotEmpty().longerThan(2),
          enforce.isUndefined()
        )
      ).toPassWith([1, 2, 3]);
    });
    it('Should fail with no rules', () => {
      expect(enforce.oneOf()).not.toPassWith(5);
    });
  });

  describe('As part of enforce', () => {
    it('Should validate the rules correctly', () => {
      enforce(77).oneOf(
        enforce.isString(),
        enforce.isNumber(),
        enforce.isUndefined()
      );

      expect(() =>
        enforce({ test: 4 }).oneOf(enforce.isNumber(), enforce.isUndefined())
      ).toThrow();
    });
  });
});
