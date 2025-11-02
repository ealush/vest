import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('isNumeric', () => {
  describe('base predicate', () => {
    it('pass for numbers', () => {
      expect(enforceLazy.isNumeric().run(0).pass).toBe(true);
      expect(enforceLazy.isNumeric().run(143).pass).toBe(true);
      expect(enforceLazy.isNumeric().run(-42).pass).toBe(true);
      expect(enforceLazy.isNumeric().run(3.14).pass).toBe(true);
      expect(enforceLazy.isNumeric().run(Infinity).pass).toBe(true);
      expect(enforceLazy.isNumeric().run(-Infinity).pass).toBe(true);
    });

    it('pass for numeric strings', () => {
      expect(enforceLazy.isNumeric().run('0').pass).toBe(true);
      expect(enforceLazy.isNumeric().run('143').pass).toBe(true);
      expect(enforceLazy.isNumeric().run('-42').pass).toBe(true);
      expect(enforceLazy.isNumeric().run('3.14').pass).toBe(true);
    });

    it('fails for NaN', () => {
      const nan: any = NaN;
      expect(enforceLazy.isNumeric().run(nan).pass).toBe(false);
    });

    it('fails for non-numeric strings', () => {
      expect(enforceLazy.isNumeric().run('1hello').pass).toBe(false);
      expect(enforceLazy.isNumeric().run('hi').pass).toBe(false);
      expect(enforceLazy.isNumeric().run('').pass).toBe(false);
      expect(enforceLazy.isNumeric().run('abc123').pass).toBe(false);
    });

    it('fails for other types', () => {
      // @ts-expect-error - testing that non-numeric types are rejected
      expect(enforceLazy.isNumeric().run(true).pass).toBe(false);
      // @ts-expect-error - testing that non-numeric types are rejected
      expect(enforceLazy.isNumeric().run(false).pass).toBe(false);
      // @ts-expect-error - testing that non-numeric types are rejected
      expect(enforceLazy.isNumeric().run({}).pass).toBe(false);
      // @ts-expect-error - testing that non-numeric types are rejected
      expect(enforceLazy.isNumeric().run([]).pass).toBe(false);
    });
  });

  describe('greaterThan', () => {
    it('pass when numeric string is greater', () => {
      expect(enforceLazy.isNumeric().greaterThan(1).run('2').pass).toBe(true);
      expect(enforceLazy.isNumeric().greaterThan(0).run('5').pass).toBe(true);
    });

    it('pass when number is greater', () => {
      expect(enforceLazy.isNumeric().greaterThan(1).run(2).pass).toBe(true);
      expect(enforceLazy.isNumeric().greaterThan(0).run(5).pass).toBe(true);
    });

    it('fails when value is not greater', () => {
      expect(enforceLazy.isNumeric().greaterThan(5).run('5').pass).toBe(false);
      expect(enforceLazy.isNumeric().greaterThan(5).run('3').pass).toBe(false);
      expect(enforceLazy.isNumeric().greaterThan(5).run(3).pass).toBe(false);
    });
  });

  describe('lessThan', () => {
    it('pass when numeric string is less', () => {
      expect(enforceLazy.isNumeric().lessThan(5).run('3').pass).toBe(true);
      expect(enforceLazy.isNumeric().lessThan(0).run('-1').pass).toBe(true);
    });

    it('pass when number is less', () => {
      expect(enforceLazy.isNumeric().lessThan(5).run(3).pass).toBe(true);
      expect(enforceLazy.isNumeric().lessThan(0).run(-1).pass).toBe(true);
    });

    it('fails when value is not less', () => {
      expect(enforceLazy.isNumeric().lessThan(5).run('5').pass).toBe(false);
      expect(enforceLazy.isNumeric().lessThan(5).run('6').pass).toBe(false);
    });
  });

  describe('isBetween', () => {
    it('pass when numeric string is between', () => {
      expect(enforceLazy.isNumeric().isBetween(0, 10).run('5').pass).toBe(true);
      expect(enforceLazy.isNumeric().isBetween(0, 10).run('0').pass).toBe(true);
      expect(enforceLazy.isNumeric().isBetween(0, 10).run('10').pass).toBe(
        true,
      );
    });

    it('pass when number is between', () => {
      expect(enforceLazy.isNumeric().isBetween(0, 10).run(5).pass).toBe(true);
    });

    it('fails when value is outside range', () => {
      expect(enforceLazy.isNumeric().isBetween(0, 10).run('-1').pass).toBe(
        false,
      );
      expect(enforceLazy.isNumeric().isBetween(0, 10).run('11').pass).toBe(
        false,
      );
    });
  });

  describe('numberEquals', () => {
    it('pass when numeric strings are equal', () => {
      expect(enforceLazy.isNumeric().numberEquals('2').run('2').pass).toBe(
        true,
      );
      expect(enforceLazy.isNumeric().numberEquals(5).run('5').pass).toBe(true);
    });

    it('pass when number matches', () => {
      expect(enforceLazy.isNumeric().numberEquals('2').run(2).pass).toBe(true);
    });

    it('fails when values are not equal', () => {
      expect(enforceLazy.isNumeric().numberEquals('2').run('3').pass).toBe(
        false,
      );
      expect(enforceLazy.isNumeric().numberEquals(5).run('4').pass).toBe(false);
    });
  });

  describe('isEven', () => {
    it('pass for even numeric strings', () => {
      expect(enforceLazy.isNumeric().isEven().run('0').pass).toBe(true);
      expect(enforceLazy.isNumeric().isEven().run('2').pass).toBe(true);
      expect(enforceLazy.isNumeric().isEven().run('42').pass).toBe(true);
    });

    it('pass for even numbers', () => {
      expect(enforceLazy.isNumeric().isEven().run(2).pass).toBe(true);
      expect(enforceLazy.isNumeric().isEven().run(42).pass).toBe(true);
    });

    it('fails for odd values', () => {
      expect(enforceLazy.isNumeric().isEven().run('1').pass).toBe(false);
      expect(enforceLazy.isNumeric().isEven().run('3').pass).toBe(false);
      expect(enforceLazy.isNumeric().isEven().run(1).pass).toBe(false);
    });
  });

  describe('isOdd', () => {
    it('pass for odd numeric strings', () => {
      expect(enforceLazy.isNumeric().isOdd().run('1').pass).toBe(true);
      expect(enforceLazy.isNumeric().isOdd().run('3').pass).toBe(true);
      expect(enforceLazy.isNumeric().isOdd().run('99').pass).toBe(true);
    });

    it('pass for odd numbers', () => {
      expect(enforceLazy.isNumeric().isOdd().run(1).pass).toBe(true);
      expect(enforceLazy.isNumeric().isOdd().run(3).pass).toBe(true);
    });

    it('fails for even values', () => {
      expect(enforceLazy.isNumeric().isOdd().run('0').pass).toBe(false);
      expect(enforceLazy.isNumeric().isOdd().run('2').pass).toBe(false);
      expect(enforceLazy.isNumeric().isOdd().run(2).pass).toBe(false);
    });
  });

  describe('isNegative', () => {
    it('pass for negative numeric strings', () => {
      expect(enforceLazy.isNumeric().isNegative().run('-1').pass).toBe(true);
      expect(enforceLazy.isNumeric().isNegative().run('-42').pass).toBe(true);
    });

    it('pass for negative numbers', () => {
      expect(enforceLazy.isNumeric().isNegative().run(-1).pass).toBe(true);
      expect(enforceLazy.isNumeric().isNegative().run(-42).pass).toBe(true);
    });

    it('fails for positive values and zero', () => {
      expect(enforceLazy.isNumeric().isNegative().run('0').pass).toBe(false);
      expect(enforceLazy.isNumeric().isNegative().run('1').pass).toBe(false);
      expect(enforceLazy.isNumeric().isNegative().run(1).pass).toBe(false);
    });
  });

  describe('isPositive', () => {
    it('pass for positive numeric strings', () => {
      expect(enforceLazy.isNumeric().isPositive().run('1').pass).toBe(true);
      expect(enforceLazy.isNumeric().isPositive().run('42').pass).toBe(true);
    });

    it('pass for positive numbers', () => {
      expect(enforceLazy.isNumeric().isPositive().run(1).pass).toBe(true);
      expect(enforceLazy.isNumeric().isPositive().run(42).pass).toBe(true);
    });

    it('fails for zero and negative values', () => {
      expect(enforceLazy.isNumeric().isPositive().run('0').pass).toBe(false);
      expect(enforceLazy.isNumeric().isPositive().run('-1').pass).toBe(false);
      expect(enforceLazy.isNumeric().isPositive().run(-1).pass).toBe(false);
    });
  });
});
