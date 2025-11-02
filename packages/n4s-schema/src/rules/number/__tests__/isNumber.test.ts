import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('isNumber', () => {
  describe('base predicate', () => {
    it('pass for numbers (non-NaN)', () => {
      expect(enforceLazy.isNumber().run(0).pass).toBe(true);
      expect(enforceLazy.isNumber().run(1).pass).toBe(true);
      expect(enforceLazy.isNumber().run(42).pass).toBe(true);
      expect(enforceLazy.isNumber().run(-1).pass).toBe(true);
      expect(enforceLazy.isNumber().run(3.14).pass).toBe(true);
      expect(enforceLazy.isNumber().run(Infinity).pass).toBe(true);
      expect(enforceLazy.isNumber().run(-Infinity).pass).toBe(true);
    });

    it('fails for NaN', () => {
      expect(enforceLazy.isNumber().run(NaN).pass).toBe(false);
    });

    it('fails for non-numbers', () => {
      const str: any = '1';
      const bool: any = true;
      const obj: any = {};
      const arr: any = [];
      expect(enforceLazy.isNumber().run(str).pass).toBe(false);
      expect(enforceLazy.isNumber().run(bool).pass).toBe(false);
      expect(enforceLazy.isNumber().run(obj).pass).toBe(false);
      expect(enforceLazy.isNumber().run(arr).pass).toBe(false);
    });
  });

  describe('greaterThan', () => {
    it('pass when number is greater', () => {
      expect(enforceLazy.isNumber().greaterThan(0).run(1).pass).toBe(true);
      expect(enforceLazy.isNumber().greaterThan(5).run(10).pass).toBe(true);
      expect(enforceLazy.isNumber().greaterThan(-10).run(-5).pass).toBe(true);
    });

    it('fails when number is not greater', () => {
      expect(enforceLazy.isNumber().greaterThan(1).run(0).pass).toBe(false);
      expect(enforceLazy.isNumber().greaterThan(5).run(5).pass).toBe(false);
      expect(enforceLazy.isNumber().greaterThan(10).run(5).pass).toBe(false);
    });
  });

  describe('greaterThanOrEquals', () => {
    it('pass when number is greater or equal', () => {
      expect(enforceLazy.isNumber().greaterThanOrEquals(0).run(1).pass).toBe(
        true,
      );
      expect(enforceLazy.isNumber().greaterThanOrEquals(5).run(5).pass).toBe(
        true,
      );
      expect(enforceLazy.isNumber().greaterThanOrEquals(5).run(10).pass).toBe(
        true,
      );
    });

    it('fails when number is less', () => {
      expect(enforceLazy.isNumber().greaterThanOrEquals(5).run(4).pass).toBe(
        false,
      );
      expect(enforceLazy.isNumber().greaterThanOrEquals(0).run(-1).pass).toBe(
        false,
      );
    });
  });

  describe('lessThan', () => {
    it('pass when number is less', () => {
      expect(enforceLazy.isNumber().lessThan(5).run(4).pass).toBe(true);
      expect(enforceLazy.isNumber().lessThan(0).run(-1).pass).toBe(true);
      expect(enforceLazy.isNumber().lessThan(10).run(5).pass).toBe(true);
    });

    it('fails when number is not less', () => {
      expect(enforceLazy.isNumber().lessThan(5).run(5).pass).toBe(false);
      expect(enforceLazy.isNumber().lessThan(5).run(6).pass).toBe(false);
    });
  });

  describe('lessThanOrEquals', () => {
    it('pass when number is less or equal', () => {
      expect(enforceLazy.isNumber().lessThanOrEquals(5).run(4).pass).toBe(true);
      expect(enforceLazy.isNumber().lessThanOrEquals(5).run(5).pass).toBe(true);
      expect(enforceLazy.isNumber().lessThanOrEquals(1).run(1).pass).toBe(true);
    });

    it('fails when number is greater', () => {
      expect(enforceLazy.isNumber().lessThanOrEquals(5).run(6).pass).toBe(
        false,
      );
      expect(enforceLazy.isNumber().lessThanOrEquals(0).run(1).pass).toBe(
        false,
      );
    });
  });

  describe('isBetween', () => {
    it('pass when number is between bounds', () => {
      expect(enforceLazy.isNumber().isBetween(0, 10).run(5).pass).toBe(true);
      expect(enforceLazy.isNumber().isBetween(0, 10).run(0).pass).toBe(true);
      expect(enforceLazy.isNumber().isBetween(0, 10).run(10).pass).toBe(true);
    });

    it('fails when number is outside bounds', () => {
      expect(enforceLazy.isNumber().isBetween(0, 10).run(-1).pass).toBe(false);
      expect(enforceLazy.isNumber().isBetween(0, 10).run(11).pass).toBe(false);
    });
  });

  describe('numberEquals', () => {
    it('pass when numbers are equal', () => {
      expect(enforceLazy.isNumber().numberEquals(5).run(5).pass).toBe(true);
      expect(enforceLazy.isNumber().numberEquals('2').run(2).pass).toBe(true);
      expect(enforceLazy.isNumber().numberEquals(0).run(0).pass).toBe(true);
    });

    it('fails when numbers are not equal', () => {
      expect(enforceLazy.isNumber().numberEquals(5).run(4).pass).toBe(false);
      expect(enforceLazy.isNumber().numberEquals('2').run(3).pass).toBe(false);
    });
  });

  describe('numberNotEquals', () => {
    it('pass when numbers are not equal', () => {
      expect(enforceLazy.isNumber().numberNotEquals(5).run(4).pass).toBe(true);
      expect(enforceLazy.isNumber().numberNotEquals('2').run(3).pass).toBe(
        true,
      );
      expect(enforceLazy.isNumber().numberNotEquals(0).run(1).pass).toBe(true);
    });

    it('fails when numbers are equal', () => {
      expect(enforceLazy.isNumber().numberNotEquals(5).run(5).pass).toBe(false);
      expect(enforceLazy.isNumber().numberNotEquals('2').run(2).pass).toBe(
        false,
      );
    });
  });

  describe('isEven', () => {
    it('pass for even numbers', () => {
      expect(enforceLazy.isNumber().isEven().run(0).pass).toBe(true);
      expect(enforceLazy.isNumber().isEven().run(2).pass).toBe(true);
      expect(enforceLazy.isNumber().isEven().run(42).pass).toBe(true);
      expect(enforceLazy.isNumber().isEven().run(-2).pass).toBe(true);
    });

    it('fails for odd numbers', () => {
      expect(enforceLazy.isNumber().isEven().run(1).pass).toBe(false);
      expect(enforceLazy.isNumber().isEven().run(3).pass).toBe(false);
      expect(enforceLazy.isNumber().isEven().run(-1).pass).toBe(false);
    });
  });

  describe('isOdd', () => {
    it('pass for odd numbers', () => {
      expect(enforceLazy.isNumber().isOdd().run(1).pass).toBe(true);
      expect(enforceLazy.isNumber().isOdd().run(3).pass).toBe(true);
      expect(enforceLazy.isNumber().isOdd().run(-1).pass).toBe(true);
      expect(enforceLazy.isNumber().isOdd().run(99).pass).toBe(true);
    });

    it('fails for even numbers', () => {
      expect(enforceLazy.isNumber().isOdd().run(0).pass).toBe(false);
      expect(enforceLazy.isNumber().isOdd().run(2).pass).toBe(false);
      expect(enforceLazy.isNumber().isOdd().run(-2).pass).toBe(false);
    });
  });

  describe('isNegative', () => {
    it('pass for negative numbers', () => {
      expect(enforceLazy.isNumber().isNegative().run(-1).pass).toBe(true);
      expect(enforceLazy.isNumber().isNegative().run(-42).pass).toBe(true);
      expect(enforceLazy.isNumber().isNegative().run(-Infinity).pass).toBe(
        true,
      );
    });

    it('fails for positive numbers and zero', () => {
      expect(enforceLazy.isNumber().isNegative().run(0).pass).toBe(false);
      expect(enforceLazy.isNumber().isNegative().run(1).pass).toBe(false);
      expect(enforceLazy.isNumber().isNegative().run(42).pass).toBe(false);
    });
  });

  describe('isPositive', () => {
    it('pass for positive numbers', () => {
      expect(enforceLazy.isNumber().isPositive().run(1).pass).toBe(true);
      expect(enforceLazy.isNumber().isPositive().run(42).pass).toBe(true);
      expect(enforceLazy.isNumber().isPositive().run(Infinity).pass).toBe(true);
    });

    it('fails for zero and negative numbers', () => {
      expect(enforceLazy.isNumber().isPositive().run(0).pass).toBe(false);
      expect(enforceLazy.isNumber().isPositive().run(-1).pass).toBe(false);
      expect(enforceLazy.isNumber().isPositive().run(-42).pass).toBe(false);
    });
  });
});
