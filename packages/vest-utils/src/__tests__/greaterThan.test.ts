import { faker } from '@faker-js/faker';
import { greaterThan } from 'greaterThan';
import { describe, it, expect, beforeEach } from 'vitest';

describe('Tests greaterThan rule', () => {
  describe('Arguments are numbers', () => {
    let arg0: number;

    beforeEach(() => {
      arg0 = faker.number.int();
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
      arg0 = faker.number.int().toString();
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
    [faker.lorem.word(), `${faker.number.int()}`.split(''), {}].forEach(
      element => {
        it('Should return false', () => {
          // @ts-expect-error - testing invalid input
          expect(greaterThan(element, 0)).toBe(false);
        });
      },
    );
  });
});
