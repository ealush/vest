import { enforce } from 'enforce';
import { isKeyOf, isNotKeyOf } from 'isKeyOf';

const FRUITES = {
  apples: 5,
  bananas: 2,
  cantelopes: 0,
};

const TOP_GROSSING_MOVIES = {
  1976: 'Rocky',
  1988: 'Rain Man',
  2008: 'The Dark Knight',
};

const DUMMY_KEY = 'key';

describe('Tests isKeyOf rule', () => {
  describe('When the key exists in the object', () => {
    it('Should return true', () => {
      expect(isKeyOf('bananas', FRUITES)).toBe(true);
      expect(isKeyOf(1976, TOP_GROSSING_MOVIES)).toBe(true);
    });

    it('Should return true using enforce', () => {
      enforce('bananas').isKeyOf(FRUITES);
      enforce(1976).isKeyOf(TOP_GROSSING_MOVIES);
    });
  });

  describe('When the key does not exists in the object', () => {
    it('Should return false', () => {
      expect(isKeyOf('avocado', FRUITES)).toBe(false);
      expect(isKeyOf(1999, TOP_GROSSING_MOVIES)).toBe(false);
    });

    it.each([undefined, null, false, true, Object, [], '', Function.prototype])(
      'Should throw when %s is an object',
      v => {
        expect(() => enforce(DUMMY_KEY).isKeyOf({ v })).toThrow();
      }
    );
  });
});

describe('Tests isNotKeyOf rule', () => {
  describe('When the key does not exists in the object', () => {
    it('Should return true', () => {
      expect(isNotKeyOf('avocado', FRUITES)).toBe(true);
    });

    it('Should return true using enforce', () => {
      enforce(1999).isNotKeyOf(TOP_GROSSING_MOVIES);
    });
  });

  describe('When the key exists in the object', () => {
    it('Should return false', () => {
      expect(isNotKeyOf(1976, TOP_GROSSING_MOVIES)).toBe(false);
    });
  });
});
