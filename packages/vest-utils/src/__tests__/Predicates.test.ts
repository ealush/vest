import { all, any } from 'Predicates';
import { describe, it, vi, expect } from 'vitest';

describe('Predicates', () => {
  describe('all', () => {
    it('Should return a predicate function', () => {
      expect(typeof all()).toBe('function');
    });

    it('Should return true if all predicates return true', () => {
      const predicate = all(
        value => value > 0,
        value => value < 10,
      );

      expect(predicate(5)).toBe(true);
    });

    it('Should return false if any predicate returns false', () => {
      const predicate = all(
        value => value > 0,
        value => value < 10,
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
        'not a function',
      );

      expect(predicate(15)).toBe(false);
    });

    it('Should pass each predicate the value', () => {
      const spy1 = vi.fn(value => value > 0);
      const spy2 = vi.fn(value => value < 10);

      const predicate = all(spy1, spy2);

      predicate(5);

      expect(spy1).toHaveBeenCalledWith(5);
      expect(spy2).toHaveBeenCalledWith(5);
    });

    it('When passing explicit true as a predicate, should return true', () => {
      expect(all(true, true, true)(5)).toBe(true);
    });

    it('When passing explicit false as a predicate, should return false', () => {
      expect(all(true, false, false)(5)).toBe(false);
    });
  });

  describe('any', () => {
    it('Shold return a predicate function', () => {
      expect(typeof any()).toBe('function');
    });

    it('Should return true if any predicate returns true', () => {
      expect(
        any(
          value => value > 0,
          value => value === 10,
        )(5),
      ).toBe(true);
      expect(
        any(
          value => value === 10,
          value => value > 0,
        )(5),
      ).toBe(true);
    });

    it('Should return true if all predicates return true', () => {
      const predicate = any(
        value => value > 0,
        value => value === 10,
      );

      expect(predicate(10)).toBe(true);
    });

    it('Should return false if all predicates return false', () => {
      const predicate = any(
        value => value > 0,
        value => value === 10,
      );

      expect(predicate(-5)).toBe(false);
    });

    it('Should return false if no predicates are passed', () => {
      const predicate = any();

      expect(predicate(15)).toBe(false);
    });

    it('When passing explicit true as a predicate, should return true', () => {
      expect(any(true, false, false)(5)).toBe(true);
    });

    it('When passing explicit false as a predicate, should return false', () => {
      expect(any(false, false, false)(5)).toBe(false);
    });
  });
});
