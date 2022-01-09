import { isKeyOf } from 'isKeyOf';

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
  it('When the key exists in the object', () => {
    expect(isKeyOf('bananas', FRUITES)).toBe(true);
  });

  it('When the key not exists in the object', () => {
    expect(isKeyOf('avocados', FRUITES)).toBe(false);
  });

  it('When the key exists in the object (numeric)', () => {
    expect(isKeyOf(1976, TOP_GROSSING_MOVIES)).toBe(true);
  });

  it.each([undefined, null, false, true, Object, [], '', Function.prototype])(
    'Should return false for %s object',
    v => {
      expect(isKeyOf(DUMMY_KEY, v)).toBe(false);
    }
  );
});
