import { describe, it, expect } from 'vitest';

import { enforce } from '../../../n4s';

const runNumeric = (value: unknown) =>
  (enforce.isNumeric() as ReturnType<typeof enforce.isNumeric> & {
    run: (value: unknown) => ReturnType<
      ReturnType<typeof enforce.isNumeric>['run']
    >;
  }).run(value);

describe('isNumeric', () => {
  describe('base predicate', () => {
    it('pass for numbers', () => {
      expect(enforce.isNumeric().run(0).pass).toBe(true);
      expect(enforce.isNumeric().run(143).pass).toBe(true);
      expect(enforce.isNumeric().run(-42).pass).toBe(true);
      expect(enforce.isNumeric().run(3.14).pass).toBe(true);
      expect(enforce.isNumeric().run(Infinity).pass).toBe(true);
      expect(enforce.isNumeric().run(-Infinity).pass).toBe(true);
    });

    it('pass for numeric strings', () => {
      expect(enforce.isNumeric().run('0').pass).toBe(true);
      expect(enforce.isNumeric().run('143').pass).toBe(true);
      expect(enforce.isNumeric().run('-42').pass).toBe(true);
      expect(enforce.isNumeric().run('3.14').pass).toBe(true);
    });

    it('fails for NaN', () => {
      const nan: any = NaN;
      expect(enforce.isNumeric().run(nan).pass).toBe(false);
    });

    it('fails for non-numeric strings', () => {
      expect(enforce.isNumeric().run('1hello').pass).toBe(false);
      expect(enforce.isNumeric().run('hi').pass).toBe(false);
      expect(enforce.isNumeric().run('').pass).toBe(false);
      expect(enforce.isNumeric().run('abc123').pass).toBe(false);
    });

    it('fails for other types', () => {
      // Type test: - testing that non-numeric types are rejected
      expect(runNumeric(true).pass).toBe(false);
      // Type test: - testing that non-numeric types are rejected
      expect(runNumeric(false).pass).toBe(false);
      // Type test: - testing that non-numeric types are rejected
      expect(runNumeric({}).pass).toBe(false);
      // Type test: - testing that non-numeric types are rejected
      expect(runNumeric([]).pass).toBe(false);
    });
  });

  describe('greaterThan', () => {
    it('pass when numeric string is greater', () => {
      expect(enforce.isNumeric().greaterThan(1).run('2').pass).toBe(true);
      expect(enforce.isNumeric().greaterThan(0).run('5').pass).toBe(true);
    });

    it('pass when number is greater', () => {
      expect(enforce.isNumeric().greaterThan(1).run(2).pass).toBe(true);
      expect(enforce.isNumeric().greaterThan(0).run(5).pass).toBe(true);
    });

    it('fails when value is not greater', () => {
      expect(enforce.isNumeric().greaterThan(5).run('5').pass).toBe(false);
      expect(enforce.isNumeric().greaterThan(5).run('3').pass).toBe(false);
      expect(enforce.isNumeric().greaterThan(5).run(3).pass).toBe(false);
    });
  });

  describe('lessThan', () => {
    it('pass when numeric string is less', () => {
      expect(enforce.isNumeric().lessThan(5).run('3').pass).toBe(true);
      expect(enforce.isNumeric().lessThan(0).run('-1').pass).toBe(true);
    });

    it('pass when number is less', () => {
      expect(enforce.isNumeric().lessThan(5).run(3).pass).toBe(true);
      expect(enforce.isNumeric().lessThan(0).run(-1).pass).toBe(true);
    });

    it('fails when value is not less', () => {
      expect(enforce.isNumeric().lessThan(5).run('5').pass).toBe(false);
      expect(enforce.isNumeric().lessThan(5).run('6').pass).toBe(false);
    });
  });

  describe('isBetween', () => {
    it('pass when numeric string is between', () => {
      expect(enforce.isNumeric().isBetween(0, 10).run('5').pass).toBe(true);
      expect(enforce.isNumeric().isBetween(0, 10).run('0').pass).toBe(true);
      expect(enforce.isNumeric().isBetween(0, 10).run('10').pass).toBe(true);
    });

    it('pass when number is between', () => {
      expect(enforce.isNumeric().isBetween(0, 10).run(5).pass).toBe(true);
    });

    it('fails when value is outside range', () => {
      expect(enforce.isNumeric().isBetween(0, 10).run('-1').pass).toBe(false);
      expect(enforce.isNumeric().isBetween(0, 10).run('11').pass).toBe(false);
    });
  });

  describe('numberEquals', () => {
    it('pass when numeric strings are equal', () => {
      expect(enforce.isNumeric().numberEquals('2').run('2').pass).toBe(true);
      expect(enforce.isNumeric().numberEquals(5).run('5').pass).toBe(true);
    });

    it('pass when number matches', () => {
      expect(enforce.isNumeric().numberEquals('2').run(2).pass).toBe(true);
    });

    it('fails when values are not equal', () => {
      expect(enforce.isNumeric().numberEquals('2').run('3').pass).toBe(false);
      expect(enforce.isNumeric().numberEquals(5).run('4').pass).toBe(false);
    });
  });

  describe('isEven', () => {
    it('pass for even numeric strings', () => {
      expect(enforce.isNumeric().isEven().run('0').pass).toBe(true);
      expect(enforce.isNumeric().isEven().run('2').pass).toBe(true);
      expect(enforce.isNumeric().isEven().run('42').pass).toBe(true);
    });

    it('pass for even numbers', () => {
      expect(enforce.isNumeric().isEven().run(2).pass).toBe(true);
      expect(enforce.isNumeric().isEven().run(42).pass).toBe(true);
    });

    it('fails for odd values', () => {
      expect(enforce.isNumeric().isEven().run('1').pass).toBe(false);
      expect(enforce.isNumeric().isEven().run('3').pass).toBe(false);
      expect(enforce.isNumeric().isEven().run(1).pass).toBe(false);
    });
  });

  describe('isOdd', () => {
    it('pass for odd numeric strings', () => {
      expect(enforce.isNumeric().isOdd().run('1').pass).toBe(true);
      expect(enforce.isNumeric().isOdd().run('3').pass).toBe(true);
      expect(enforce.isNumeric().isOdd().run('99').pass).toBe(true);
    });

    it('pass for odd numbers', () => {
      expect(enforce.isNumeric().isOdd().run(1).pass).toBe(true);
      expect(enforce.isNumeric().isOdd().run(3).pass).toBe(true);
    });

    it('fails for even values', () => {
      expect(enforce.isNumeric().isOdd().run('0').pass).toBe(false);
      expect(enforce.isNumeric().isOdd().run('2').pass).toBe(false);
      expect(enforce.isNumeric().isOdd().run(2).pass).toBe(false);
    });
  });

  describe('isNegative', () => {
    it('pass for negative numeric strings', () => {
      expect(enforce.isNumeric().isNegative().run('-1').pass).toBe(true);
      expect(enforce.isNumeric().isNegative().run('-42').pass).toBe(true);
    });

    it('pass for negative numbers', () => {
      expect(enforce.isNumeric().isNegative().run(-1).pass).toBe(true);
      expect(enforce.isNumeric().isNegative().run(-42).pass).toBe(true);
    });

    it('fails for positive values and zero', () => {
      expect(enforce.isNumeric().isNegative().run('0').pass).toBe(false);
      expect(enforce.isNumeric().isNegative().run('1').pass).toBe(false);
      expect(enforce.isNumeric().isNegative().run(1).pass).toBe(false);
    });
  });

  describe('isPositive', () => {
    it('pass for positive numeric strings', () => {
      expect(enforce.isNumeric().isPositive().run('1').pass).toBe(true);
      expect(enforce.isNumeric().isPositive().run('42').pass).toBe(true);
    });

    it('pass for positive numbers', () => {
      expect(enforce.isNumeric().isPositive().run(1).pass).toBe(true);
      expect(enforce.isNumeric().isPositive().run(42).pass).toBe(true);
    });

    it('fails for zero and negative values', () => {
      expect(enforce.isNumeric().isPositive().run('0').pass).toBe(false);
      expect(enforce.isNumeric().isPositive().run('-1').pass).toBe(false);
      expect(enforce.isNumeric().isPositive().run(-1).pass).toBe(false);
    });
  });
});
