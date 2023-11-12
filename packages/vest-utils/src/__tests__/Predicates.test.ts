import { all } from 'Predicates';

describe('Predicates', () => {
  describe('all', () => {
    it('Should return a predicate function', () => {
      expect(typeof all()).toBe('function');
    });

    it('Should return true if all predicates return true', () => {
      const predicate = all(
        value => value > 0,
        value => value < 10
      );

      expect(predicate(5)).toBe(true);
    });

    it('Should return false if any predicate returns false', () => {
      const predicate = all(
        value => value > 0,
        value => value < 10
      );

      expect(predicate(15)).toBe(false);
    });

    it('Should return false if no predicates are passed', () => {
      const predicate = all();

      expect(predicate(15)).toBe(false);
    });

    it('Should return false if predicates are not functions', () => {
      const predicate = all(
        value => value > 0,
        value => value < 10,
        // @ts-ignore - Testing invalid input
        'not a function'
      );

      expect(predicate(15)).toBe(false);
    });

    it('Should pass each predicate the value', () => {
      const spy1 = jest.fn(value => value > 0);
      const spy2 = jest.fn(value => value < 10);

      const predicate = all(spy1, spy2);

      predicate(5);

      expect(spy1).toHaveBeenCalledWith(5);
      expect(spy2).toHaveBeenCalledWith(5);
    });
  });
});
