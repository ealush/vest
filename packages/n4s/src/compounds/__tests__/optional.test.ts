import enforce from 'enforce';

describe('enforce.optional', () => {
  describe('lazy interface', () => {
    it('Should return a passing result for nullable values', () => {
      expect(enforce.optional(enforce.isNumber()).run(null)).toEqual({
        pass: true,
      });
      expect(enforce.optional(enforce.isArray()).run(undefined)).toEqual({
        pass: true,
      });

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
      ).toEqual({ pass: true });
    });

    it('Should return passing result for non-nullable values that satisfy the tests', () => {
      expect(enforce.optional(enforce.isNumber()).run(2)).toEqual({
        pass: true,
      });
      expect(enforce.optional(enforce.isArray()).run([1, 2])).toEqual({
        pass: true,
      });
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
      ).toEqual({ pass: true });
    });

    it('Should return a failing result for non-nullable values that do not satisfy the tests', () => {
      expect(enforce.optional(enforce.isNumber()).run('2')).toEqual({
        pass: false,
      });
      expect(enforce.optional(enforce.isArray()).run('2')).toEqual({
        pass: false,
      });
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
      ).toEqual({ pass: false });
    });
  });
});
