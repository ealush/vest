import { describe, it, expect } from 'vitest';
import { noneOf } from '../schemaRules';
import { RuleInstance } from '../enforce';

const isNumber: RuleInstance<number> = {
  run: (v: any) => ({ passes: typeof v === 'number', type: v }),
  infer: {} as number,
};

const isGreaterThan = (n: number): RuleInstance<number> => ({
  run: (v: number) => ({ passes: v > n, type: v }),
  infer: {} as number,
});

describe('noneOf', () => {
  it('should return a rule instance', () => {
    const rule = noneOf(isNumber);
    expect(rule).toHaveProperty('run');
    expect(rule).toHaveProperty('infer');
  });

  it('should pass if no rules pass', () => {
    const rule = noneOf(isNumber, isGreaterThan(10));
    const result = rule.run('a string');
    expect(result.passes).toBe(true);
  });

  it('should fail if any rule passes', () => {
    const rule = noneOf(isNumber, isGreaterThan(10));
    expect(rule.run(5).passes).toBe(false); // isNumber passes
    expect(rule.run(12).passes).toBe(false); // isNumber and isGreaterThan(10) pass
    expect(rule.run('a string').passes).toBe(true);
  });

  it('should pass with no rules', () => {
    const rule = noneOf();
    const result = rule.run('any value');
    expect(result.passes).toBe(true);
  });
});