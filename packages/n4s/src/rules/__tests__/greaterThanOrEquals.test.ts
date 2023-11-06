import { faker } from '@faker-js/faker';

import { greaterThanOrEquals } from 'greaterThanOrEquals';

describe('Tests greaterThanOrEquals rule', () => {
  describe('Arguments are numbers', () => {
    let arg0: number;
    beforeEach(() => {
      arg0 = faker.number.int();
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
        expect(greaterThanOrEquals('10', '9')).toBe(true);
      });
    });

    describe('When first argument is smaller', () => {
      it('Should return true', () => {
        expect(greaterThanOrEquals('9', '10')).toBe(false);
      });
    });

    describe('When values are equal', () => {
      it('Should return true', () => {
        expect(greaterThanOrEquals('1000', '1000')).toBe(true);
      });
    });
  });

  describe('Arguments are non numeric', () => {
    [faker.lorem.word(), `${faker.number.int()}`.split(''), {}].forEach(
      element => {
        it('Should return false', () => {
          // @ts-expect-error - Testing invalid input
          expect(greaterThanOrEquals(element, 0)).toBe(false);
        });
      }
    );
  });
});
