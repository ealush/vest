import enforce from 'enforce';

describe('allOf validation', () => {
  describe('Base behavior', () => {
    it('Should fail when at least one rule fails', () => {
      expect(
        enforce.allOf(enforce.isString(), enforce.longerThan(10))
      ).not.toPassWith('test');
    });
    it('Should succeed when all of the rules apply', () => {
      expect(
        enforce.allOf(enforce.isString(), enforce.longerThan(3))
      ).toPassWith('test');
    });
    it('Should fail when no rules are provided', () => {
      expect(enforce.allOf()).not.toPassWith(3);
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

    it('Should validate allof rules correctly', () => {
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
