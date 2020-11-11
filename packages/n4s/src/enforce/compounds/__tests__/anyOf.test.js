import enforce from 'enforce';
import anyOf from 'anyOf';

describe('AnyOf validation', () => {
  describe('Base behavior', () => {
    it('Should fail when all rules fail', () => {
      expect(
        anyOf(
          'test',
          enforce.isNumber(),
          enforce.isUndefined()
        )
      ).toBe(false);
    });
    it('Should succeed when atleast one rule applies', () => {
      expect(
        anyOf(
          5,
          enforce.isString(),
          enforce.isNumber(),
          enforce.isUndefined()
        )
      ).toBe(true);
    });
    it('Should fail with no rules', () => {
      expect(
        anyOf(5)
      ).toBe(false);
    });
  });

  describe('As part of enforce', () => {
    it('Should validate anyof the rules correctly', () => {
      expect(
        enforce(77).anyOf(
          enforce.isString(),
          enforce.isNumber(),
          enforce.isUndefined()
        )
      );

      expect(() =>
        enforce({ test: 4 }).anyOf(
          enforce.isNumber(),
          enforce.isUndefined()
        )
      ).toThrow();
    });
  });
});
