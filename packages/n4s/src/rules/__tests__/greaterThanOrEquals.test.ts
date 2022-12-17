import { random, datatype } from '@faker-js/faker';

import { greaterThanOrEquals } from 'greaterThanOrEquals';

describe('Tests greaterThanOrEquals rule', () => {
  let arg0;

  describe('Arguments are numbers', () => {
    beforeEach(() => {
      arg0 = datatype.number();
    });

    describe('When first argument is larger', () => {
      it('Should return true', () => {
        expect(greaterThanOrEquals(arg0, arg0 - 1)).toBe(true);
      });
    });

    describe('When first argument is smaller', () => {
      it('Should return true', () => {
        expect(greaterThanOrEquals(arg0, arg0 + 1)).toBe(false);
      });
    });

    describe('When values are equal', () => {
      it('Should return true', () => {
        expect(greaterThanOrEquals(arg0, arg0)).toBe(true);
      });
    });
  });

  describe('Arguments are numeric strings', () => {
    describe('When first argument is larger', () => {
      it('Should return true', () => {
        expect(greaterThanOrEquals(`${arg0}`, `${arg0 - 1}`)).toBe(true);
      });
    });

    describe('When first argument is smaller', () => {
      it('Should return true', () => {
        expect(greaterThanOrEquals(`${arg0}`, `${arg0 + 1}`)).toBe(false);
      });
    });

    describe('When values are equal', () => {
      it('Should return true', () => {
        expect(greaterThanOrEquals(arg0, arg0)).toBe(true);
      });
    });
  });

  describe('Arguments are non numeric', () => {
    [random.word(), `${datatype.number()}`.split(''), {}].forEach(element => {
      it('Should return false', () => {
        expect(greaterThanOrEquals(element, 0)).toBe(false);
      });
    });
  });
});
