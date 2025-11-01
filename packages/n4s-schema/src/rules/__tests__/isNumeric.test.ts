import { describe, it, expect } from 'vitest';

import { isNumeric } from '../numeric/isNumeric';

describe('isNumeric', () => {
  describe('base predicate', () => {
    it('passes for numbers', () => {
      expect(isNumeric().run(0).passes).toBe(true);
      expect(isNumeric().run(143).passes).toBe(true);
      expect(isNumeric().run(-42).passes).toBe(true);
      expect(isNumeric().run(3.14).passes).toBe(true);
      expect(isNumeric().run(Infinity).passes).toBe(true);
      expect(isNumeric().run(-Infinity).passes).toBe(true);
    });

    it('passes for numeric strings', () => {
      expect(isNumeric().run('0').passes).toBe(true);
      expect(isNumeric().run('143').passes).toBe(true);
      expect(isNumeric().run('-42').passes).toBe(true);
      expect(isNumeric().run('3.14').passes).toBe(true);
    });

    it('fails for NaN', () => {
      const nan: any = NaN;
      expect(isNumeric().run(nan).passes).toBe(false);
    });

    it('fails for non-numeric strings', () => {
      expect(isNumeric().run('1hello').passes).toBe(false);
      expect(isNumeric().run('hi').passes).toBe(false);
      expect(isNumeric().run('').passes).toBe(false);
      expect(isNumeric().run('abc123').passes).toBe(false);
    });

    it('fails for other types', () => {
      // @ts-expect-error - testing that non-numeric types are rejected
      expect(isNumeric().run(true).passes).toBe(false);
      // @ts-expect-error - testing that non-numeric types are rejected
      expect(isNumeric().run(false).passes).toBe(false);
      // @ts-expect-error - testing that non-numeric types are rejected
      expect(isNumeric().run({}).passes).toBe(false);
      // @ts-expect-error - testing that non-numeric types are rejected
      expect(isNumeric().run([]).passes).toBe(false);
    });
  });

  describe('greaterThan', () => {
    it('passes when numeric string is greater', () => {
      expect(isNumeric().greaterThan(1).run('2').passes).toBe(true);
      expect(isNumeric().greaterThan(0).run('5').passes).toBe(true);
    });

    it('passes when number is greater', () => {
      expect(isNumeric().greaterThan(1).run(2).passes).toBe(true);
      expect(isNumeric().greaterThan(0).run(5).passes).toBe(true);
    });

    it('fails when value is not greater', () => {
      expect(isNumeric().greaterThan(5).run('5').passes).toBe(false);
      expect(isNumeric().greaterThan(5).run('3').passes).toBe(false);
      expect(isNumeric().greaterThan(5).run(3).passes).toBe(false);
    });
  });

  describe('lessThan', () => {
    it('passes when numeric string is less', () => {
      expect(isNumeric().lessThan(5).run('3').passes).toBe(true);
      expect(isNumeric().lessThan(0).run('-1').passes).toBe(true);
    });

    it('passes when number is less', () => {
      expect(isNumeric().lessThan(5).run(3).passes).toBe(true);
      expect(isNumeric().lessThan(0).run(-1).passes).toBe(true);
    });

    it('fails when value is not less', () => {
      expect(isNumeric().lessThan(5).run('5').passes).toBe(false);
      expect(isNumeric().lessThan(5).run('6').passes).toBe(false);
    });
  });

  describe('between', () => {
    it('passes when numeric string is between', () => {
      expect(isNumeric().between(0, 10).run('5').passes).toBe(true);
      expect(isNumeric().between(0, 10).run('0').passes).toBe(true);
      expect(isNumeric().between(0, 10).run('10').passes).toBe(true);
    });

    it('passes when number is between', () => {
      expect(isNumeric().between(0, 10).run(5).passes).toBe(true);
    });

    it('fails when value is outside range', () => {
      expect(isNumeric().between(0, 10).run('-1').passes).toBe(false);
      expect(isNumeric().between(0, 10).run('11').passes).toBe(false);
    });
  });

  describe('numberEquals', () => {
    it('passes when numeric strings are equal', () => {
      expect(isNumeric().numberEquals('2').run('2').passes).toBe(true);
      expect(isNumeric().numberEquals(5).run('5').passes).toBe(true);
    });

    it('passes when number matches', () => {
      expect(isNumeric().numberEquals('2').run(2).passes).toBe(true);
    });

    it('fails when values are not equal', () => {
      expect(isNumeric().numberEquals('2').run('3').passes).toBe(false);
      expect(isNumeric().numberEquals(5).run('4').passes).toBe(false);
    });
  });

  describe('isEven', () => {
    it('passes for even numeric strings', () => {
      expect(isNumeric().isEven().run('0').passes).toBe(true);
      expect(isNumeric().isEven().run('2').passes).toBe(true);
      expect(isNumeric().isEven().run('42').passes).toBe(true);
    });

    it('passes for even numbers', () => {
      expect(isNumeric().isEven().run(2).passes).toBe(true);
      expect(isNumeric().isEven().run(42).passes).toBe(true);
    });

    it('fails for odd values', () => {
      expect(isNumeric().isEven().run('1').passes).toBe(false);
      expect(isNumeric().isEven().run('3').passes).toBe(false);
      expect(isNumeric().isEven().run(1).passes).toBe(false);
    });
  });

  describe('isOdd', () => {
    it('passes for odd numeric strings', () => {
      expect(isNumeric().isOdd().run('1').passes).toBe(true);
      expect(isNumeric().isOdd().run('3').passes).toBe(true);
      expect(isNumeric().isOdd().run('99').passes).toBe(true);
    });

    it('passes for odd numbers', () => {
      expect(isNumeric().isOdd().run(1).passes).toBe(true);
      expect(isNumeric().isOdd().run(3).passes).toBe(true);
    });

    it('fails for even values', () => {
      expect(isNumeric().isOdd().run('0').passes).toBe(false);
      expect(isNumeric().isOdd().run('2').passes).toBe(false);
      expect(isNumeric().isOdd().run(2).passes).toBe(false);
    });
  });

  describe('isNegative', () => {
    it('passes for negative numeric strings', () => {
      expect(isNumeric().isNegative().run('-1').passes).toBe(true);
      expect(isNumeric().isNegative().run('-42').passes).toBe(true);
    });

    it('passes for negative numbers', () => {
      expect(isNumeric().isNegative().run(-1).passes).toBe(true);
      expect(isNumeric().isNegative().run(-42).passes).toBe(true);
    });

    it('fails for positive values and zero', () => {
      expect(isNumeric().isNegative().run('0').passes).toBe(false);
      expect(isNumeric().isNegative().run('1').passes).toBe(false);
      expect(isNumeric().isNegative().run(1).passes).toBe(false);
    });
  });

  describe('isPositive', () => {
    it('passes for positive numeric strings', () => {
      expect(isNumeric().isPositive().run('1').passes).toBe(true);
      expect(isNumeric().isPositive().run('42').passes).toBe(true);
    });

    it('passes for positive numbers', () => {
      expect(isNumeric().isPositive().run(1).passes).toBe(true);
      expect(isNumeric().isPositive().run(42).passes).toBe(true);
    });

    it('fails for zero and negative values', () => {
      expect(isNumeric().isPositive().run('0').passes).toBe(false);
      expect(isNumeric().isPositive().run('-1').passes).toBe(false);
      expect(isNumeric().isPositive().run(-1).passes).toBe(false);
    });
  });
});
