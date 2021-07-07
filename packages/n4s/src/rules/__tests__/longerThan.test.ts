import faker from 'faker';

import { longerThan } from 'longerThan';

describe('Tests longerThan rule', () => {
  const length = faker.datatype.number();
  const word = faker.random.word();
  const boolean = faker.datatype.boolean();

  describe('First argument is array or string', () => {
    describe('When first argument is longer', () => {
      it('Should return true for an array longer than length', () => {
        expect(longerThan(new Array(length), length - 1)).toBe(true);
      });

      it('Should return true for a string longer than word length', () => {
        expect(longerThan(word, word.length - 1)).toBe(true);
      });
    });

    describe('When first argument is shorter', () => {
      it('Should return false for an array shorter than length', () => {
        expect(longerThan(new Array(length), length + 1)).toBe(false);
      });

      it('Should return false for a string shorter than word length', () => {
        expect(longerThan(word, word.length + 1)).toBe(false);
      });
    });

    describe('When first argument is equal to a given value', () => {
      it('Should return false for an array equal to length', () => {
        expect(longerThan(new Array(length), length)).toBe(false);
      });

      it('Should return false for a string equal to word length', () => {
        expect(longerThan(word, word.length)).toBe(false);
      });
    });
  });

  describe("First argument isn't array or string", () => {
    it('Should throw error', () => {
      // @ts-expect-error - testing wrong input
      expect(() => longerThan(undefined, 0)).toThrow(TypeError);
    });

    it('Should return false for number argument', () => {
      expect(longerThan(length, 0)).toBe(false);
    });

    it('Should return false for boolean argument', () => {
      expect(longerThan(boolean, 0)).toBe(false);
    });
  });
});
