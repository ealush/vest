import enforce from 'enforce';
import * as ruleReturn from 'ruleReturn';

describe('enforce.optional', () => {
  describe('lazy interface', () => {
    it('Should return a passing result for nullable values', () => {
      expect(enforce.optional(enforce.isNumber()).run(null)).toEqual(
        ruleReturn.passing()
      );
      expect(enforce.optional(enforce.isArray()).run(undefined)).toEqual(
        ruleReturn.passing()
      );

      expect(
        enforce
          .shape({
            firstName: enforce.isString(),
            middleName: enforce.optional(enforce.isString()),
            lastName: enforce.isString(),
          })
          .run({
            firstName: 'John',
            lastName: 'Doe',
          })
      ).toEqual(ruleReturn.passing());
    });

    it('Should return passing result for non-nullable values that satisfy the tests', () => {
      expect(enforce.optional(enforce.isNumber()).run(2)).toEqual(
        ruleReturn.passing()
      );
      expect(enforce.optional(enforce.isArray()).run([1, 2])).toEqual(
        ruleReturn.passing()
      );
      expect(
        enforce
          .shape({
            firstName: enforce.isString(),
            middleName: enforce.optional(enforce.isString()),
            lastName: enforce.isString(),
          })
          .run({
            firstName: 'John',
            middleName: 'H.',
            lastName: 'Doe',
          })
      ).toEqual(ruleReturn.passing());
    });

    it('Should return a failing result for non-nullable values that do not satisfy the tests', () => {
      expect(enforce.optional(enforce.isNumber()).run('2')).toEqual(
        ruleReturn.failing()
      );
      expect(enforce.optional(enforce.isArray()).run('2')).toEqual(
        ruleReturn.failing()
      );
      expect(
        enforce
          .shape({
            firstName: enforce.isString(),
            middleName: enforce.optional(enforce.isString().longerThan(3)),
            lastName: enforce.isString(),
          })
          .run({
            firstName: 'John',
            middleName: 'H.',
            lastName: 'Doe',
          })
      ).toEqual(ruleReturn.failing());
    });
  });
});
