import { faker } from '@faker-js/faker';

import { lessThan } from 'lessThan';

const { random, datatype } = faker;

describe('Tests lessThan rule', () => {
  describe('Arguments are numbers', () => {
    let arg0: number = 0;
    beforeEach(() => {
      arg0 = datatype.number();
    });

    describe('When first argument is larger', () => {
      it('Should return true', () => {
        expect(lessThan(arg0, arg0 - 1)).toBe(false);
      });
    });

    describe('When first argument is smaller', () => {
      it('Should return true', () => {
        expect(lessThan(arg0, arg0 + 1)).toBe(true);
      });
    });

    describe('When values are equal', () => {
      it('Should return false', () => {
        expect(lessThan(arg0, arg0)).toBe(false);
      });
    });
  });

  describe('Arguments are numeric strings', () => {
    let arg0: string = '0';
    beforeEach(() => {
      arg0 = datatype.number().toString();
    });
    describe('When first argument is larger', () => {
      it('Should return true', () => {
        expect(lessThan('10', '9')).toBe(false);
      });
    });

    describe('When first argument is smaller', () => {
      it('Should return true', () => {
        expect(lessThan('9', '10')).toBe(true);
      });
    });

    describe('When values are equal', () => {
      it('Should return false', () => {
        expect(lessThan(arg0, arg0)).toBe(false);
      });
    });
  });

  describe('Arguments are non numeric', () => {
    [random.word(), `${datatype.number()}`.split(''), {}].forEach(element => {
      it('Should return false', () => {
        // @ts-expect-error - Testing invalid input
        expect(lessThan(element, 0)).toBe(false);
      });
    });
  });
});
