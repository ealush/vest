import { describe, it, expect } from 'vitest';

import { enforce } from 'n4s';

describe('isNumber', () => {
  describe('base predicate', () => {
    it('pass for numbers (non-NaN)', () => {
      expect(enforce.isNumber().run(0).pass).toBe(true);
      expect(enforce.isNumber().run(1).pass).toBe(true);
      expect(enforce.isNumber().run(42).pass).toBe(true);
      expect(enforce.isNumber().run(-1).pass).toBe(true);
      expect(enforce.isNumber().run(3.14).pass).toBe(true);
      expect(enforce.isNumber().run(Infinity).pass).toBe(true);
      expect(enforce.isNumber().run(-Infinity).pass).toBe(true);
    });

    it('fails for NaN', () => {
      expect(enforce.isNumber().run(NaN).pass).toBe(false);
    });

    it('fails for non-numbers', () => {
      const str: any = '1';
      const bool: any = true;
      const obj: any = {};
      const arr: any = [];
      expect(enforce.isNumber().run(str).pass).toBe(false);
      expect(enforce.isNumber().run(bool).pass).toBe(false);
      expect(enforce.isNumber().run(obj).pass).toBe(false);
      expect(enforce.isNumber().run(arr).pass).toBe(false);
    });
  });

  describe('greaterThan', () => {
    it('pass when number is greater', () => {
      expect(enforce.isNumber().greaterThan(0).run(1).pass).toBe(true);
      expect(enforce.isNumber().greaterThan(5).run(10).pass).toBe(true);
      expect(enforce.isNumber().greaterThan(-10).run(-5).pass).toBe(true);
    });

    it('fails when number is not greater', () => {
      expect(enforce.isNumber().greaterThan(1).run(0).pass).toBe(false);
      expect(enforce.isNumber().greaterThan(5).run(5).pass).toBe(false);
      expect(enforce.isNumber().greaterThan(10).run(5).pass).toBe(false);
    });
  });

  describe('greaterThanOrEquals', () => {
    it('pass when number is greater or equal', () => {
      expect(enforce.isNumber().greaterThanOrEquals(0).run(1).pass).toBe(true);
      expect(enforce.isNumber().greaterThanOrEquals(5).run(5).pass).toBe(true);
      expect(enforce.isNumber().greaterThanOrEquals(5).run(10).pass).toBe(true);
    });

    it('fails when number is less', () => {
      expect(enforce.isNumber().greaterThanOrEquals(5).run(4).pass).toBe(false);
      expect(enforce.isNumber().greaterThanOrEquals(0).run(-1).pass).toBe(
        false,
      );
    });
  });

  describe('lessThan', () => {
    it('pass when number is less', () => {
      expect(enforce.isNumber().lessThan(5).run(4).pass).toBe(true);
      expect(enforce.isNumber().lessThan(0).run(-1).pass).toBe(true);
      expect(enforce.isNumber().lessThan(10).run(5).pass).toBe(true);
    });

    it('fails when number is not less', () => {
      expect(enforce.isNumber().lessThan(5).run(5).pass).toBe(false);
      expect(enforce.isNumber().lessThan(5).run(6).pass).toBe(false);
    });
  });

  describe('lessThanOrEquals', () => {
    it('pass when number is less or equal', () => {
      expect(enforce.isNumber().lessThanOrEquals(5).run(4).pass).toBe(true);
      expect(enforce.isNumber().lessThanOrEquals(5).run(5).pass).toBe(true);
      expect(enforce.isNumber().lessThanOrEquals(1).run(1).pass).toBe(true);
    });

    it('fails when number is greater', () => {
      expect(enforce.isNumber().lessThanOrEquals(5).run(6).pass).toBe(false);
      expect(enforce.isNumber().lessThanOrEquals(0).run(1).pass).toBe(false);
    });
  });

  describe('isBetween', () => {
    it('pass when number is between bounds', () => {
      expect(enforce.isNumber().isBetween(0, 10).run(5).pass).toBe(true);
      expect(enforce.isNumber().isBetween(0, 10).run(0).pass).toBe(true);
      expect(enforce.isNumber().isBetween(0, 10).run(10).pass).toBe(true);
    });

    it('fails when number is outside bounds', () => {
      expect(enforce.isNumber().isBetween(0, 10).run(-1).pass).toBe(false);
      expect(enforce.isNumber().isBetween(0, 10).run(11).pass).toBe(false);
    });
  });

  describe('numberEquals', () => {
    it('pass when numbers are equal', () => {
      expect(enforce.isNumber().numberEquals(5).run(5).pass).toBe(true);
      expect(enforce.isNumber().numberEquals('2').run(2).pass).toBe(true);
      expect(enforce.isNumber().numberEquals(0).run(0).pass).toBe(true);
    });

    it('fails when numbers are not equal', () => {
      expect(enforce.isNumber().numberEquals(5).run(4).pass).toBe(false);
      expect(enforce.isNumber().numberEquals('2').run(3).pass).toBe(false);
    });
  });

  describe('numberNotEquals', () => {
    it('pass when numbers are not equal', () => {
      expect(enforce.isNumber().numberNotEquals(5).run(4).pass).toBe(true);
      expect(enforce.isNumber().numberNotEquals('2').run(3).pass).toBe(true);
      expect(enforce.isNumber().numberNotEquals(0).run(1).pass).toBe(true);
    });

    it('fails when numbers are equal', () => {
      expect(enforce.isNumber().numberNotEquals(5).run(5).pass).toBe(false);
      expect(enforce.isNumber().numberNotEquals('2').run(2).pass).toBe(false);
    });
  });

  describe('isEven', () => {
    it('pass for even numbers', () => {
      expect(enforce.isNumber().isEven().run(0).pass).toBe(true);
      expect(enforce.isNumber().isEven().run(2).pass).toBe(true);
      expect(enforce.isNumber().isEven().run(42).pass).toBe(true);
      expect(enforce.isNumber().isEven().run(-2).pass).toBe(true);
    });

    it('fails for odd numbers', () => {
      expect(enforce.isNumber().isEven().run(1).pass).toBe(false);
      expect(enforce.isNumber().isEven().run(3).pass).toBe(false);
      expect(enforce.isNumber().isEven().run(-1).pass).toBe(false);
    });
  });

  describe('isOdd', () => {
    it('pass for odd numbers', () => {
      expect(enforce.isNumber().isOdd().run(1).pass).toBe(true);
      expect(enforce.isNumber().isOdd().run(3).pass).toBe(true);
      expect(enforce.isNumber().isOdd().run(-1).pass).toBe(true);
      expect(enforce.isNumber().isOdd().run(99).pass).toBe(true);
    });

    it('fails for even numbers', () => {
      expect(enforce.isNumber().isOdd().run(0).pass).toBe(false);
      expect(enforce.isNumber().isOdd().run(2).pass).toBe(false);
      expect(enforce.isNumber().isOdd().run(-2).pass).toBe(false);
    });
  });

  describe('isNegative', () => {
    it('pass for negative numbers', () => {
      expect(enforce.isNumber().isNegative().run(-1).pass).toBe(true);
      expect(enforce.isNumber().isNegative().run(-42).pass).toBe(true);
      expect(enforce.isNumber().isNegative().run(-Infinity).pass).toBe(true);
    });

    it('fails for positive numbers and zero', () => {
      expect(enforce.isNumber().isNegative().run(0).pass).toBe(false);
      expect(enforce.isNumber().isNegative().run(1).pass).toBe(false);
      expect(enforce.isNumber().isNegative().run(42).pass).toBe(false);
    });
  });

  describe('isPositive', () => {
    it('pass for positive numbers', () => {
      expect(enforce.isNumber().isPositive().run(1).pass).toBe(true);
      expect(enforce.isNumber().isPositive().run(42).pass).toBe(true);
      expect(enforce.isNumber().isPositive().run(Infinity).pass).toBe(true);
    });

    it('fails for zero and negative numbers', () => {
      expect(enforce.isNumber().isPositive().run(0).pass).toBe(false);
      expect(enforce.isNumber().isPositive().run(-1).pass).toBe(false);
      expect(enforce.isNumber().isPositive().run(-42).pass).toBe(false);
    });
  });
});
