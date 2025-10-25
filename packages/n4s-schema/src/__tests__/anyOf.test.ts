import { describe, it, expect } from 'vitest';
import { anyOf } from '../schemaRules';
import { RuleInstance } from '../enforce';

const isNumber: RuleInstance<any> = {
  run: (v: any) => ({ passes: typeof v === 'number', type: v }),
  infer: {} as any,
};

const isString: RuleInstance<any> = {
  run: (v: any) => ({ passes: typeof v === 'string', type: v }),
  infer: {} as any,
};

const isGreaterThan = (n: number): RuleInstance<any> => ({
  run: (v: any) => ({ passes: typeof v === 'number' && v > n, type: v }),
  infer: {} as any,
});

describe('anyOf', () => {
  it('should return a rule instance', () => {
    const rule = anyOf(isNumber);
    expect(rule).toHaveProperty('run');
    expect(rule).toHaveProperty('infer');
  });

  it('should pass if at least one rule passes', () => {
    const rule = anyOf(isString, isGreaterThan(10));
    expect(rule.run(5).passes).toBe(false);
    expect(rule.run(15).passes).toBe(true);
    expect(rule.run('hello').passes).toBe(true);
  });

  it('should fail if all rules fail', () => {
    const rule = anyOf(isString, isGreaterThan(10));
    const result = rule.run(5);
    expect(result.passes).toBe(false);
  });

  it('should fail with no rules', () => {
    const rule = anyOf();
    const result = rule.run('any value');
    expect(result.passes).toBe(false);
  });
});