import { random, datatype } from 'faker';

import { greaterThan } from 'greaterThan';

describe('Tests greaterThan rule', () => {
  let arg0;

  describe('Arguments are numbers', () => {
    beforeEach(() => {
      arg0 = datatype.number();
    });

    describe('When first argument is larger', () => {
      it('Should return true', () => {
        expect(greaterThan(arg0, arg0 - 1)).toBe(true);
      });
    });

    describe('When first argument is smaller', () => {
      it('Should return true', () => {
        expect(greaterThan(arg0, arg0 + 1)).toBe(false);
      });
    });

    describe('When values are equal', () => {
      it('Should return false', () => {
        expect(greaterThan(arg0, arg0)).toBe(false);
      });
    });
  });

  describe('Arguments are numeric strings', () => {
    describe('When first argument is larger', () => {
      it('Should return true', () => {
        expect(greaterThan(`${arg0}`, `${arg0 - 1}`)).toBe(true);
      });
    });

    describe('When first argument is smaller', () => {
      it('Should return true', () => {
        expect(greaterThan(`${arg0}`, `${arg0 + 1}`)).toBe(false);
      });
    });

    describe('When values are equal', () => {
      it('Should return false', () => {
        expect(greaterThan(arg0, arg0)).toBe(false);
      });
    });
  });

  describe('Arguments are non numeric', () => {
    [random.word(), `${datatype.number()}`.split(''), {}].forEach(element => {
      it('Should return false', () => {
        expect(greaterThan(element, 0)).toBe(false);
      });
    });
  });
});
