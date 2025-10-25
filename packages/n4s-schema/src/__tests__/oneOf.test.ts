import { describe, it, expect } from 'vitest';
import { oneOf } from '../schemaRules';
import { RuleInstance } from '../enforce';

const isNumber: RuleInstance<number> = {
  run: (v: any) => ({ passes: typeof v === 'number', type: v }),
  infer: {} as number,
};

const isGreaterThan = (n: number): RuleInstance<number> => ({
  run: (v: number) => ({ passes: v > n, type: v }),
  infer: {} as number,
});

const isLessThan = (n: number): RuleInstance<number> => ({
  run: (v: number) => ({ passes: v < n, type: v }),
  infer: {} as number,
});

describe('oneOf', () => {
  it('should return a rule instance', () => {
    const rule = oneOf(isNumber);
    expect(rule).toHaveProperty('run');
    expect(rule).toHaveProperty('infer');
  });

  it('should pass if exactly one rule passes', () => {
    const rule = oneOf(isGreaterThan(10), isLessThan(5));
    expect(rule.run(12).passes).toBe(true);
    expect(rule.run(3).passes).toBe(true);
  });

  it('should fail if more than one rule passes', () => {
    const rule = oneOf(isGreaterThan(5), isGreaterThan(10));
    const result = rule.run(12);
    expect(result.passes).toBe(false);
  });

  it('should fail if no rules pass', () => {
    const rule = oneOf(isGreaterThan(10), isLessThan(5));
    const result = rule.run(7);
    expect(result.passes).toBe(false);
  });

  it('should fail with no rules', () => {
    const rule = oneOf();
    const result = rule.run('any value');
    expect(result.passes).toBe(false);
  });
});