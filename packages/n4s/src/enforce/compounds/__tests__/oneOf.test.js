import enforce from 'enforce';
import oneOf from 'oneOf';

describe('OneOf validation', () => {
  describe('Base behavior', () => {
    it('Should fail when all rules fail', () => {
      expect(
        oneOf(
          'test',
          enforce.isNumber(),
          enforce.isUndefined()
        )
      ).toBe(false);
    });
    it('Should succeed when EXACTLY one rule applies', () => {
      expect(
        oneOf(
          5,
          enforce.isString(),
          enforce.isNumber(),
          enforce.isUndefined()
        )
      ).toBe(true);
    });
    it('Should fail when more than one rule applies', () => {
      expect(
        oneOf(
          5,
          enforce.isNumber(),
          enforce.isNumber().greaterThan(3),
        )
      ).toBe(false);
    });
    it('Should succeed when rule chaining', () => {
      expect(
        oneOf(
          [1, 2, 3],
          enforce.isArray().isNotEmpty().longerThan(2),
          enforce.isUndefined()
        )
      ).toBe(true);
    });
    it('Should fail with no rules', () => {
      expect(
        oneOf(5)
      ).toBe(false);
    });
  });

  describe('As part of enforce', () => {
    it('Should validate the rules correctly', () => {
      enforce(77).oneOf(
        enforce.isString(),
        enforce.isNumber(),
        enforce.isUndefined()
      )

      expect(() =>
        enforce({ test: 4 }).oneOf(
          enforce.isNumber(),
          enforce.isUndefined()
        )
      ).toThrow();
    });
  });
});
