import _ from 'lodash';

import removeElementFromArray from 'removeElementFromArray';

describe('Tests removeElementFromArray', () => {
  describe('When found', () => {
    it('Should return the same array', () => {
      const arr = [1, 2, 3];

      expect(removeElementFromArray(arr, 3)).toBe(arr);
    });

    it('Should remove found element', () => {
      const foundElement = {};

      const arr = [1, 2, foundElement];
      expect(removeElementFromArray(arr, foundElement)).toEqual([1, 2]);
    });
  });

  describe('When not found', () => {
    it('Should keep array unchanged', () => {
      const arr = [1, 2, {}, null];

      expect(removeElementFromArray(_.cloneDeep(arr), 777)).toEqual(arr);
    });

    it('Should return the same array', () => {
      const arr = [1, 2, {}, null];
      expect(removeElementFromArray(arr, 777)).toBe(arr);
    });
  });
});
