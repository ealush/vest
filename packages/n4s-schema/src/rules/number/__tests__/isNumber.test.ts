import { describe, it, expect } from 'vitest';

import { enforceLazy } from '../../../lazy';

describe('isNumber', () => {
  describe('base predicate', () => {
    it('passes for numbers (non-NaN)', () => {
      expect(enforceLazy.isNumber().run(0).passes).toBe(true);
      expect(enforceLazy.isNumber().run(1).passes).toBe(true);
      expect(enforceLazy.isNumber().run(42).passes).toBe(true);
      expect(enforceLazy.isNumber().run(-1).passes).toBe(true);
      expect(enforceLazy.isNumber().run(3.14).passes).toBe(true);
      expect(enforceLazy.isNumber().run(Infinity).passes).toBe(true);
      expect(enforceLazy.isNumber().run(-Infinity).passes).toBe(true);
    });

    it('fails for NaN', () => {
      expect(enforceLazy.isNumber().run(NaN).passes).toBe(false);
    });

    it('fails for non-numbers', () => {
      const str: any = '1';
      const bool: any = true;
      const obj: any = {};
      const arr: any = [];
      expect(enforceLazy.isNumber().run(str).passes).toBe(false);
      expect(enforceLazy.isNumber().run(bool).passes).toBe(false);
      expect(enforceLazy.isNumber().run(obj).passes).toBe(false);
      expect(enforceLazy.isNumber().run(arr).passes).toBe(false);
    });
  });

  describe('greaterThan', () => {
    it('passes when number is greater', () => {
      expect(enforceLazy.isNumber().greaterThan(0).run(1).passes).toBe(true);
      expect(enforceLazy.isNumber().greaterThan(5).run(10).passes).toBe(true);
      expect(enforceLazy.isNumber().greaterThan(-10).run(-5).passes).toBe(true);
    });

    it('fails when number is not greater', () => {
      expect(enforceLazy.isNumber().greaterThan(1).run(0).passes).toBe(false);
      expect(enforceLazy.isNumber().greaterThan(5).run(5).passes).toBe(false);
      expect(enforceLazy.isNumber().greaterThan(10).run(5).passes).toBe(false);
    });
  });

  describe('greaterThanOrEquals', () => {
    it('passes when number is greater or equal', () => {
      expect(enforceLazy.isNumber().greaterThanOrEquals(0).run(1).passes).toBe(true);
      expect(enforceLazy.isNumber().greaterThanOrEquals(5).run(5).passes).toBe(true);
      expect(enforceLazy.isNumber().greaterThanOrEquals(5).run(10).passes).toBe(true);
    });

    it('fails when number is less', () => {
      expect(enforceLazy.isNumber().greaterThanOrEquals(5).run(4).passes).toBe(false);
      expect(enforceLazy.isNumber().greaterThanOrEquals(0).run(-1).passes).toBe(false);
    });
  });

  describe('lessThan', () => {
    it('passes when number is less', () => {
      expect(enforceLazy.isNumber().lessThan(5).run(4).passes).toBe(true);
      expect(enforceLazy.isNumber().lessThan(0).run(-1).passes).toBe(true);
      expect(enforceLazy.isNumber().lessThan(10).run(5).passes).toBe(true);
    });

    it('fails when number is not less', () => {
      expect(enforceLazy.isNumber().lessThan(5).run(5).passes).toBe(false);
      expect(enforceLazy.isNumber().lessThan(5).run(6).passes).toBe(false);
    });
  });

  describe('lessThanOrEquals', () => {
    it('passes when number is less or equal', () => {
      expect(enforceLazy.isNumber().lessThanOrEquals(5).run(4).passes).toBe(true);
      expect(enforceLazy.isNumber().lessThanOrEquals(5).run(5).passes).toBe(true);
      expect(enforceLazy.isNumber().lessThanOrEquals(1).run(1).passes).toBe(true);
    });

    it('fails when number is greater', () => {
      expect(enforceLazy.isNumber().lessThanOrEquals(5).run(6).passes).toBe(false);
      expect(enforceLazy.isNumber().lessThanOrEquals(0).run(1).passes).toBe(false);
    });
  });

  describe('between', () => {
    it('passes when number is between bounds', () => {
      expect(enforceLazy.isNumber().between(0, 10).run(5).passes).toBe(true);
      expect(enforceLazy.isNumber().between(0, 10).run(0).passes).toBe(true);
      expect(enforceLazy.isNumber().between(0, 10).run(10).passes).toBe(true);
    });

    it('fails when number is outside bounds', () => {
      expect(enforceLazy.isNumber().between(0, 10).run(-1).passes).toBe(false);
      expect(enforceLazy.isNumber().between(0, 10).run(11).passes).toBe(false);
    });
  });

  describe('numberEquals', () => {
    it('passes when numbers are equal', () => {
      expect(enforceLazy.isNumber().numberEquals(5).run(5).passes).toBe(true);
      expect(enforceLazy.isNumber().numberEquals('2').run(2).passes).toBe(true);
      expect(enforceLazy.isNumber().numberEquals(0).run(0).passes).toBe(true);
    });

    it('fails when numbers are not equal', () => {
      expect(enforceLazy.isNumber().numberEquals(5).run(4).passes).toBe(false);
      expect(enforceLazy.isNumber().numberEquals('2').run(3).passes).toBe(false);
    });
  });

  describe('numberNotEquals', () => {
    it('passes when numbers are not equal', () => {
      expect(enforceLazy.isNumber().numberNotEquals(5).run(4).passes).toBe(true);
      expect(enforceLazy.isNumber().numberNotEquals('2').run(3).passes).toBe(true);
      expect(enforceLazy.isNumber().numberNotEquals(0).run(1).passes).toBe(true);
    });

    it('fails when numbers are equal', () => {
      expect(enforceLazy.isNumber().numberNotEquals(5).run(5).passes).toBe(false);
      expect(enforceLazy.isNumber().numberNotEquals('2').run(2).passes).toBe(false);
    });
  });

  describe('isEven', () => {
    it('passes for even numbers', () => {
      expect(enforceLazy.isNumber().isEven().run(0).passes).toBe(true);
      expect(enforceLazy.isNumber().isEven().run(2).passes).toBe(true);
      expect(enforceLazy.isNumber().isEven().run(42).passes).toBe(true);
      expect(enforceLazy.isNumber().isEven().run(-2).passes).toBe(true);
    });

    it('fails for odd numbers', () => {
      expect(enforceLazy.isNumber().isEven().run(1).passes).toBe(false);
      expect(enforceLazy.isNumber().isEven().run(3).passes).toBe(false);
      expect(enforceLazy.isNumber().isEven().run(-1).passes).toBe(false);
    });
  });

  describe('isOdd', () => {
    it('passes for odd numbers', () => {
      expect(enforceLazy.isNumber().isOdd().run(1).passes).toBe(true);
      expect(enforceLazy.isNumber().isOdd().run(3).passes).toBe(true);
      expect(enforceLazy.isNumber().isOdd().run(-1).passes).toBe(true);
      expect(enforceLazy.isNumber().isOdd().run(99).passes).toBe(true);
    });

    it('fails for even numbers', () => {
      expect(enforceLazy.isNumber().isOdd().run(0).passes).toBe(false);
      expect(enforceLazy.isNumber().isOdd().run(2).passes).toBe(false);
      expect(enforceLazy.isNumber().isOdd().run(-2).passes).toBe(false);
    });
  });

  describe('isNegative', () => {
    it('passes for negative numbers', () => {
      expect(enforceLazy.isNumber().isNegative().run(-1).passes).toBe(true);
      expect(enforceLazy.isNumber().isNegative().run(-42).passes).toBe(true);
      expect(enforceLazy.isNumber().isNegative().run(-Infinity).passes).toBe(true);
    });

    it('fails for positive numbers and zero', () => {
      expect(enforceLazy.isNumber().isNegative().run(0).passes).toBe(false);
      expect(enforceLazy.isNumber().isNegative().run(1).passes).toBe(false);
      expect(enforceLazy.isNumber().isNegative().run(42).passes).toBe(false);
    });
  });

  describe('isPositive', () => {
    it('passes for positive numbers', () => {
      expect(enforceLazy.isNumber().isPositive().run(1).passes).toBe(true);
      expect(enforceLazy.isNumber().isPositive().run(42).passes).toBe(true);
      expect(enforceLazy.isNumber().isPositive().run(Infinity).passes).toBe(true);
    });

    it('fails for zero and negative numbers', () => {
      expect(enforceLazy.isNumber().isPositive().run(0).passes).toBe(false);
      expect(enforceLazy.isNumber().isPositive().run(-1).passes).toBe(false);
      expect(enforceLazy.isNumber().isPositive().run(-42).passes).toBe(false);
    });
  });
});
