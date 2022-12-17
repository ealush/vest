import { faker } from '@faker-js/faker';

import { greaterThan } from 'greaterThan';

const { random, datatype } = faker;

describe('Tests greaterThan rule', () => {
  describe('Arguments are numbers', () => {
    let arg0: number;

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
    let arg0: string;

    beforeEach(() => {
      arg0 = datatype.number().toString();
    });

    describe('When first argument is larger', () => {
      it('Should return true', () => {
        expect(greaterThan('100', '99')).toBe(true);
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
        // @ts-expect-error - testing invalid input
        expect(greaterThan(element, 0)).toBe(false);
      });
    });
  });
});
