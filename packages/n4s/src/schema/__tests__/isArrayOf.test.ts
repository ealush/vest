import enforce from 'enforce';
import * as ruleReturn from 'ruleReturn';

describe('enforce.isArrayOf', () => {
  describe('lazy interface', () => {
    it('Should return a passing return for an empty array', () => {
      expect(enforce.isArrayOf(enforce.isString()).run([])).toEqual(
        ruleReturn.passing()
      );
    });

    it('Should return a passing return for valid arrays', () => {
      expect(
        enforce.isArrayOf(enforce.isString()).run(['a', 'b', 'c'])
      ).toEqual(ruleReturn.passing());

      expect(
        enforce
          .isArrayOf(enforce.anyOf(enforce.isString(), enforce.isNumber()))
          .run([1, 'b', 'c'])
      ).toEqual(ruleReturn.passing());

      expect(
        enforce
          .isArrayOf(
            enforce.shape({
              id: enforce.isNumber(),
              username: enforce.isString(),
            })
          )
          .run([
            { id: 1, username: 'b' },
            { id: 2, username: 'c' },
          ])
      ).toEqual(ruleReturn.passing());
    });

    it('Should return a failing return for invalid arrays', () => {
      expect(enforce.isArrayOf(enforce.isString()).run([1, 2, 3])).toEqual(
        ruleReturn.failing()
      );

      expect(
        enforce
          .isArrayOf(enforce.allOf(enforce.isString(), enforce.isNumber()))
          .run([1, 2, 3])
      ).toEqual(ruleReturn.failing());

      expect(
        enforce
          .isArrayOf(
            enforce.shape({
              id: enforce.isNumber(),
              username: enforce.isString(),
            })
          )
          .run([
            { id: '1', username: 'b' },
            { id: '2', username: 'c' },
            { id: '3', username: 'd' },
          ])
      ).toEqual(ruleReturn.failing());
    });
  });

  describe('eager interface', () => {
    it('Should return silently for an empty array', () => {
      enforce([]).isArrayOf(enforce.isString());
    });

    it('Should return silently for valid arrays', () => {
      enforce(['a', 'b', 'c']).isArrayOf(enforce.isString());

      enforce([1, 'b', 'c']).isArrayOf(
        enforce.anyOf(enforce.isString(), enforce.isNumber())
      );

      enforce([
        { id: 1, username: 'b' },
        { id: 2, username: 'c' },
      ]).isArrayOf(
        enforce.shape({
          id: enforce.isNumber(),
          username: enforce.isString(),
        })
      );
    });

    it('Should throw for invalid arrays', () => {
      expect(() => enforce([1, 2, 3]).isArrayOf(enforce.isString())).toThrow();

      expect(() =>
        enforce([1, 2, 3]).isArrayOf(
          enforce.allOf(enforce.isString(), enforce.isNumber())
        )
      ).toThrow();

      expect(() =>
        enforce([
          { id: '1', username: 'b' },
          { id: '2', username: 'c' },
          { id: '3', username: 'd' },
        ]).isArrayOf(
          enforce.shape({
            id: enforce.isNumber(),
            username: enforce.isString(),
          })
        )
      ).toThrow();
    });
  });
});
