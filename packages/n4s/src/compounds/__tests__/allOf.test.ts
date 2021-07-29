import enforce from 'enforce';
import * as ruleReturn from 'ruleReturn';

describe('allOf', () => {
  describe('Lazy Assertions', () => {
    describe('When all rules  are satisfied', () => {
      it('Should return a passing result', () => {
        expect(
          enforce.allOf(enforce.isArray(), enforce.longerThan(2)).run([1, 2, 3])
        ).toEqual(ruleReturn.passing());
      });
    });
  });
});
