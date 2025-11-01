import { describe, it, expect } from 'vitest';

import { isNumber } from '../number/isNumber';

describe('isNumber', () => {
  describe('base predicate', () => {
    it('passes for numbers (non-NaN)', () => {
      expect(isNumber().run(0).passes).toBe(true);
      expect(isNumber().run(1).passes).toBe(true);
      expect(isNumber().run(42).passes).toBe(true);
      expect(isNumber().run(-1).passes).toBe(true);
      expect(isNumber().run(3.14).passes).toBe(true);
      expect(isNumber().run(Infinity).passes).toBe(true);
      expect(isNumber().run(-Infinity).passes).toBe(true);
    });

    it('fails for NaN', () => {
      expect(isNumber().run(NaN).passes).toBe(false);
    });

    it('fails for non-numbers', () => {
      const str: any = '1';
      const bool: any = true;
      const obj: any = {};
      const arr: any = [];
      expect(isNumber().run(str).passes).toBe(false);
      expect(isNumber().run(bool).passes).toBe(false);
      expect(isNumber().run(obj).passes).toBe(false);
      expect(isNumber().run(arr).passes).toBe(false);
    });
  });

  describe('greaterThan', () => {
    it('passes when number is greater', () => {
      expect(isNumber().greaterThan(0).run(1).passes).toBe(true);
      expect(isNumber().greaterThan(5).run(10).passes).toBe(true);
      expect(isNumber().greaterThan(-10).run(-5).passes).toBe(true);
    });

    it('fails when number is not greater', () => {
      expect(isNumber().greaterThan(1).run(0).passes).toBe(false);
      expect(isNumber().greaterThan(5).run(5).passes).toBe(false);
      expect(isNumber().greaterThan(10).run(5).passes).toBe(false);
    });
  });

  describe('greaterThanOrEquals', () => {
    it('passes when number is greater or equal', () => {
      expect(isNumber().greaterThanOrEquals(0).run(1).passes).toBe(true);
      expect(isNumber().greaterThanOrEquals(5).run(5).passes).toBe(true);
      expect(isNumber().greaterThanOrEquals(5).run(10).passes).toBe(true);
    });

    it('fails when number is less', () => {
      expect(isNumber().greaterThanOrEquals(5).run(4).passes).toBe(false);
      expect(isNumber().greaterThanOrEquals(0).run(-1).passes).toBe(false);
    });
  });

  describe('lessThan', () => {
    it('passes when number is less', () => {
      expect(isNumber().lessThan(5).run(4).passes).toBe(true);
      expect(isNumber().lessThan(0).run(-1).passes).toBe(true);
      expect(isNumber().lessThan(10).run(5).passes).toBe(true);
    });

    it('fails when number is not less', () => {
      expect(isNumber().lessThan(5).run(5).passes).toBe(false);
      expect(isNumber().lessThan(5).run(6).passes).toBe(false);
    });
  });

  describe('lessThanOrEquals', () => {
    it('passes when number is less or equal', () => {
      expect(isNumber().lessThanOrEquals(5).run(4).passes).toBe(true);
      expect(isNumber().lessThanOrEquals(5).run(5).passes).toBe(true);
      expect(isNumber().lessThanOrEquals(1).run(1).passes).toBe(true);
    });

    it('fails when number is greater', () => {
      expect(isNumber().lessThanOrEquals(5).run(6).passes).toBe(false);
      expect(isNumber().lessThanOrEquals(0).run(1).passes).toBe(false);
    });
  });

  describe('between', () => {
    it('passes when number is between bounds', () => {
      expect(isNumber().between(0, 10).run(5).passes).toBe(true);
      expect(isNumber().between(0, 10).run(0).passes).toBe(true);
      expect(isNumber().between(0, 10).run(10).passes).toBe(true);
    });

    it('fails when number is outside bounds', () => {
      expect(isNumber().between(0, 10).run(-1).passes).toBe(false);
      expect(isNumber().between(0, 10).run(11).passes).toBe(false);
    });
  });

  describe('numberEquals', () => {
    it('passes when numbers are equal', () => {
      expect(isNumber().numberEquals(5).run(5).passes).toBe(true);
      expect(isNumber().numberEquals('2').run(2).passes).toBe(true);
      expect(isNumber().numberEquals(0).run(0).passes).toBe(true);
    });

    it('fails when numbers are not equal', () => {
      expect(isNumber().numberEquals(5).run(4).passes).toBe(false);
      expect(isNumber().numberEquals('2').run(3).passes).toBe(false);
    });
  });

  describe('numberNotEquals', () => {
    it('passes when numbers are not equal', () => {
      expect(isNumber().numberNotEquals(5).run(4).passes).toBe(true);
      expect(isNumber().numberNotEquals('2').run(3).passes).toBe(true);
      expect(isNumber().numberNotEquals(0).run(1).passes).toBe(true);
    });

    it('fails when numbers are equal', () => {
      expect(isNumber().numberNotEquals(5).run(5).passes).toBe(false);
      expect(isNumber().numberNotEquals('2').run(2).passes).toBe(false);
    });
  });

  describe('isEven', () => {
    it('passes for even numbers', () => {
      expect(isNumber().isEven().run(0).passes).toBe(true);
      expect(isNumber().isEven().run(2).passes).toBe(true);
      expect(isNumber().isEven().run(42).passes).toBe(true);
      expect(isNumber().isEven().run(-2).passes).toBe(true);
    });

    it('fails for odd numbers', () => {
      expect(isNumber().isEven().run(1).passes).toBe(false);
      expect(isNumber().isEven().run(3).passes).toBe(false);
      expect(isNumber().isEven().run(-1).passes).toBe(false);
    });
  });

  describe('isOdd', () => {
    it('passes for odd numbers', () => {
      expect(isNumber().isOdd().run(1).passes).toBe(true);
      expect(isNumber().isOdd().run(3).passes).toBe(true);
      expect(isNumber().isOdd().run(-1).passes).toBe(true);
      expect(isNumber().isOdd().run(99).passes).toBe(true);
    });

    it('fails for even numbers', () => {
      expect(isNumber().isOdd().run(0).passes).toBe(false);
      expect(isNumber().isOdd().run(2).passes).toBe(false);
      expect(isNumber().isOdd().run(-2).passes).toBe(false);
    });
  });

  describe('isNegative', () => {
    it('passes for negative numbers', () => {
      expect(isNumber().isNegative().run(-1).passes).toBe(true);
      expect(isNumber().isNegative().run(-42).passes).toBe(true);
      expect(isNumber().isNegative().run(-Infinity).passes).toBe(true);
    });

    it('fails for positive numbers and zero', () => {
      expect(isNumber().isNegative().run(0).passes).toBe(false);
      expect(isNumber().isNegative().run(1).passes).toBe(false);
      expect(isNumber().isNegative().run(42).passes).toBe(false);
    });
  });

  describe('isPositive', () => {
    it('passes for positive numbers', () => {
      expect(isNumber().isPositive().run(1).passes).toBe(true);
      expect(isNumber().isPositive().run(42).passes).toBe(true);
      expect(isNumber().isPositive().run(Infinity).passes).toBe(true);
    });

    it('fails for zero and negative numbers', () => {
      expect(isNumber().isPositive().run(0).passes).toBe(false);
      expect(isNumber().isPositive().run(-1).passes).toBe(false);
      expect(isNumber().isPositive().run(-42).passes).toBe(false);
    });
  });
});
