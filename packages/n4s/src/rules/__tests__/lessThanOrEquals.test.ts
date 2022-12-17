import { faker } from '@faker-js/faker';

import { lessThanOrEquals } from 'lessThanOrEquals';

const { random, datatype } = faker;

describe('Tests lessThanOrEquals rule', () => {
  describe('Arguments are numbers', () => {
    let arg0: number;
    beforeEach(() => {
      arg0 = datatype.number();
    });

    describe('When first argument is larger', () => {
      it('Should return true', () => {
        expect(lessThanOrEquals(arg0, arg0 - 1)).toBe(false);
      });
    });

    describe('When first argument is smaller', () => {
      it('Should return true', () => {
        expect(lessThanOrEquals(arg0, arg0 + 1)).toBe(true);
      });
    });

    describe('When values are equal', () => {
      it('Should return true', () => {
        expect(lessThanOrEquals(arg0, arg0)).toBe(true);
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
        expect(lessThanOrEquals('10', '9')).toBe(false);
      });
    });

    describe('When first argument is smaller', () => {
      it('Should return true', () => {
        expect(lessThanOrEquals('9', '10')).toBe(true);
      });
    });

    describe('When values are equal', () => {
      it('Should return true', () => {
        expect(lessThanOrEquals(arg0, arg0)).toBe(true);
      });
    });
  });

  describe('Arguments are non numeric', () => {
    [random.word(), `${datatype.number()}`.split(''), {}].forEach(element => {
      it('Should return false', () => {
        // @ts-expect-error - Testing invalid input
        expect(lessThanOrEquals(element, 0)).toBe(false);
      });
    });
  });
});
