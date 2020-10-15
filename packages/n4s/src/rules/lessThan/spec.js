import { random } from 'faker';
import { lessThan } from '.';

describe('Tests lessThan rule', () => {
  let arg0;

  describe('Arguments are numbers', () => {
    beforeEach(() => {
      arg0 = random.number();
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
    describe('When first argument is larger', () => {
      it('Should return true', () => {
        expect(lessThan(`${arg0}`, `${arg0 - 1}`)).toBe(false);
      });
    });

    describe('When first argument is smaller', () => {
      it('Should return true', () => {
        expect(lessThan(`${arg0}`, `${arg0 + 1}`)).toBe(true);
      });
    });

    describe('When values are equal', () => {
      it('Should return false', () => {
        expect(lessThan(arg0, arg0)).toBe(false);
      });
    });
  });

  describe('Arguments are non numeric', () => {
    [random.word(), `${random.number()}`.split(''), {}].forEach(element => {
      it('Should return false', () => {
        expect(lessThan(element, 0)).toBe(false);
      });
    });
  });
});
