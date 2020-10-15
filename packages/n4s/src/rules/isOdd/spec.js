import faker from 'faker';
import { isOdd } from '.';

describe('Tests isOdd rule', () => {
  describe('When value is an odd number', () => {
    const oddNumbers = [];

    beforeAll(() => {
      let counter = 1;
      while (oddNumbers.length < 100) {
        oddNumbers.push(counter);
        counter += 2;
      }
    });

    it('Should return true', () => {
      oddNumbers.forEach(number => {
        expect(isOdd(number)).toBe(true);
      });
    });

    describe('When value is a numeric string', () => {
      it('Should return true', () => {
        oddNumbers.forEach(number => {
          expect(isOdd(number.toString())).toBe(true);
        });
      });
    });

    describe('When value is negative', () => {
      it('Should return true', () => {
        oddNumbers.forEach(number => {
          expect(isOdd(-number)).toBe(true);
        });
      });
    });
  });

  describe('When value is an even number', () => {
    const evenNumbers = [];

    beforeAll(() => {
      let counter = 0;
      while (evenNumbers.length < 100) {
        evenNumbers.push(counter);
        counter += 2;
      }
    });

    it('Should return false', () => {
      evenNumbers.forEach(number => {
        expect(isOdd(number)).toBe(false);
        expect(isOdd(-number)).toBe(false);
        expect(isOdd(number.toString())).toBe(false);
      });
    });
  });

  describe('When value is non numeric', () => {
    it('Should return false', () => {
      [
        faker.random.word(),
        new Array(),
        new Function(),
        new Object(),
        'withNumber1',
        '1hasNumber',
      ].forEach(value => {
        expect(isOdd(value)).toBe(false);
      });
    });
  });
});
