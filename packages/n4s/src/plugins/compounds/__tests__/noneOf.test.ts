import { enforce } from 'enforce';
import * as ruleReturn from 'ruleReturn';
import 'compounds';

describe('noneOf', () => {
  describe('Lazy Assertions', () => {
    describe('When none of the rules  are satisfied', () => {
      it('Should return a passing result', () => {
        expect(
          enforce.noneOf(enforce.isArray(), enforce.longerThan(2)).run('x')
        ).toEqual(ruleReturn.passing());
      });
    });

    describe('When some of the rules are satisfied', () => {
      it('Should return a failing result', () => {
        expect(
          enforce.noneOf(enforce.isArray(), enforce.longerThan(2)).run([2])
        ).toEqual(ruleReturn.failing());
      });
    });

    describe('When all of the rules are satisfied', () => {
      it('Should return a failing result', () => {
        expect(
          enforce.noneOf(enforce.isArray(), enforce.longerThan(2)).run([2, 3])
        ).toEqual(ruleReturn.failing());
      });
    });
  });
});
