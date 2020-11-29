import allOf from 'allOf';
import enforce from 'enforce';

describe('allOf validation', () => {
  describe('Base behavior', () => {
    it('Should fail when at least one rule fail', () => {
      expect(allOf('test', enforce.isString(), enforce.longerThan(10))).toBe(
        false
      );
    });
    it('Should succeed when all of the rules applies', () => {
      expect(allOf('test', enforce.isString(), enforce.longerThan(3))).toBe(
        true
      );
    });
    it('Should fail with no rules', () => {
      expect(allOf(3)).toBe(true);
    });
  });

  describe('As part of enforce', () => {
    const User = enforce.template(
      enforce.loose({
        id: enforce.isNumber(),
        name: enforce.shape({
          first: enforce.isString(),
          last: enforce.isString(),
          middle: enforce.optional(enforce.isString()),
        }),
      })
    );

    const DisabledAccount = enforce.template(
      enforce.loose({
        disabled: enforce.equals(true),
      })
    );

    it('Should validate allof the rules correctly', () => {
      enforce({
        id: 123,
        name: { first: 'Albert', last: 'Einstein' },
        disabled: true,
      }).allOf(User, DisabledAccount);
    });

    it('Should throw if one of the rules fail', () => {
      expect(() => {
        enforce({
          id: 123,
          name: { first: 'Albert', last: 0 },
          disabled: true,
        }).allOf(User, DisabledAccount);
      }).toThrow();

      expect(() => {
        enforce({
          id: 123,
          name: { first: 'Albert', last: 'Einstein' },
          disabled: false,
        }).allOf(User, DisabledAccount);
      }).toThrow();
    });
  });
});
