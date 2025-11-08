import { faker } from '@faker-js/faker';
import { numberEquals } from 'numberEquals';
import { describe, it, expect, beforeEach } from 'vitest';

describe('Tests numberEquals rule', () => {
  describe('Arguments are numbers', () => {
    let arg0: number;
    beforeEach(() => {
      arg0 = faker.number.int();
    });

    describe('When first argument is larger', () => {
      it('Should return false', () => {
        expect(numberEquals(arg0, arg0 - 1)).toBe(false);
      });
    });

    describe('When first argument is smaller', () => {
      it('Should return false', () => {
        expect(numberEquals(arg0, arg0 + 1)).toBe(false);
      });
    });

    describe('When values are equal', () => {
      it('Should return true', () => {
        expect(numberEquals(arg0, arg0)).toBe(true);
      });
    });
  });

  describe('Arguments are numeric strings', () => {
    let arg0: string;

    beforeEach(() => {
      arg0 = faker.number.int().toString();
    });

    describe('When first argument is larger', () => {
      it('Should return false', () => {
        expect(numberEquals(`${arg0}`, `${Number(arg0) - 1}`)).toBe(false);
      });
    });

    describe('When first argument is smaller', () => {
      it('Should return false', () => {
        expect(numberEquals(`${arg0}`, `${arg0 + 1}`)).toBe(false);
      });
    });

    describe('When values are equal', () => {
      it('Should return true', () => {
        expect(numberEquals('100', '100')).toBe(true);
      });
    });
  });

  describe('Arguments are non numeric', () => {
    [faker.lorem.word(), `${faker.number.int()}`.split(''), {}].forEach(
      element => {
        it('Should return false', () => {
          // @ts-expect-error - testing invalid input
          expect(numberEquals(element, 0)).toBe(false);
        });
      },
    );
  });
});
