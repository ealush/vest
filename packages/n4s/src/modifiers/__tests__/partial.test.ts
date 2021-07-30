import enforce from 'enforce';
import * as ruleReturn from 'ruleReturn';

describe('enforce.partial', () => {
  describe('Lazy Interface', () => {
    it('Should pass when wrapped fields are undefined or null', () => {
      const rules = enforce.shape(
        enforce.partial({
          username: enforce.isString().longerThan(3),
          id: enforce.isNumeric(),
        })
      );

      expect(rules.run({})).toEqual(ruleReturn.passing());
      expect(
        rules.run({
          username: null,
          id: null,
        })
      ).toEqual(ruleReturn.passing());
    });

    it('Should pass when wrapped fields are valid', () => {
      const rules = enforce.shape(
        enforce.partial({
          username: enforce.isString().longerThan(3),
          id: enforce.isNumeric(),
        })
      );

      expect(rules.run({ username: 'foobar', id: 1 })).toEqual(
        ruleReturn.passing()
      );
    });

    it('Should pass when some wrapped fields are missing', () => {
      const rules = enforce.shape(
        enforce.partial({
          username: enforce.isString().longerThan(3),
          id: enforce.isNumeric(),
        })
      );

      expect(rules.run({ username: 'foobar' })).toEqual(ruleReturn.passing());
    });

    it('Should fail when wrapped fields are invalid', () => {
      const rules = enforce.shape(
        enforce.partial({
          username: enforce.isString().longerThan(3),
          id: enforce.isNumeric(),
        })
      );

      expect(rules.run({ username: 'foo', id: '1' })).toEqual(
        ruleReturn.failing()
      );
    });
  });

  describe('Eager interface', () => {
    it('Should pass when wrapped fields are undefined or null', () => {
      enforce({}).shape(
        enforce.partial({
          username: enforce.isString().longerThan(3),
          id: enforce.isNumeric(),
        })
      );

      enforce({
        username: null,
        id: null,
      }).shape(
        enforce.partial({
          username: enforce.isString().longerThan(3),
          id: enforce.isNumeric(),
        })
      );
    });

    it('Should pass when wrapped fields are valid', () => {
      enforce({ username: 'foobar', id: 1 }).shape(
        enforce.partial({
          username: enforce.isString().longerThan(3),
          id: enforce.isNumeric(),
        })
      );
    });

    it('Should pass when some wrapped fields are missing', () => {
      enforce({ username: 'foobar' }).shape(
        enforce.partial({
          username: enforce.isString().longerThan(3),
          id: enforce.isNumeric(),
        })
      );
    });

    it('Should fail when wrapped fields are invalid', () => {
      expect(() =>
        enforce({ username: 'foo', id: '1' }).shape(
          enforce.partial({
            username: enforce.isString().longerThan(3),
            id: enforce.isNumeric(),
          })
        )
      ).toThrow();
    });
  });

  it("Should retain rule's original constraints", () => {
    expect(
      enforce
        .shape(
          enforce.partial({
            username: enforce.isString().longerThan(3),
            id: enforce.isNumeric(),
          })
        )
        .run({ username: 'foobar', id: '1', foo: 'bar' })
    ).toEqual(ruleReturn.failing());

    expect(
      enforce
        .loose(
          enforce.partial({
            username: enforce.isString().longerThan(3),
            id: enforce.isNumeric(),
          })
        )
        .run({ username: 'foobar', id: '1', foo: 'bar' })
    ).toEqual(ruleReturn.passing());
  });
});
