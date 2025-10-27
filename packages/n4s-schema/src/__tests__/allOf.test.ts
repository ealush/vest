import { isArray } from 'vest-utils';
import { describe, it, expect } from 'vitest';

import { RuleInstance } from '../enforce';
import { allOf } from '../schemaRules';

const isNumber: RuleInstance<number> = {
  run: (v: any) => ({ passes: typeof v === 'number', type: v }),
  infer: {} as number,
};

const isGreaterThan = (n: number): RuleInstance<number> => ({
  run: (v: number) => ({ passes: v > n, type: v }),
  infer: {} as number,
});

const isArray: RuleInstance<any[]> = {
  run: (v: any) => ({ passes: Array.isArray(v), type: v }),
  infer: {} as any[],
};

describe('allOf', () => {
  it('should return a rule instance', () => {
    const rule = allOf(isNumber);
    expect(rule).toHaveProperty('run');
    expect(rule).toHaveProperty('infer');
  });

  it('should pass if all rules pass', () => {
    const rule = allOf(isNumber, isGreaterThan(5));
    const result = rule.run(10);
    expect(result.passes).toBe(true);
  });

  it('should fail if one rule fails', () => {
    const rule = allOf(isNumber, isGreaterThan(10));
    const result = rule.run(5);
    expect(result.passes).toBe(false);
  });

  it('should fail if value is of wrong type', () => {
    const rule = allOf(isNumber, isGreaterThan(5));
    const result = rule.run('10');
    expect(result.passes).toBe(false);
  });

  it('should pass with no rules', () => {
    const rule = allOf();
    const result = rule.run('any value');
    expect(result.passes).toBe(true);
  });

  describe('When all rules  are satisfied', () => {
    it('Should return a passing result', () => {
      const rule = allOf(isArray);
      const result = rule.run([1, 2, 3]);
      expect(result).toEqual({ passes: true, type: [1, 2, 3] });
    });
  });
});
