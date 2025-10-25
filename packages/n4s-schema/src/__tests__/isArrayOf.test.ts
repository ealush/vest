import { describe, it, expect } from 'vitest';
import { isArrayOf } from '../schemaRules';
import { RuleInstance } from '../enforce';

const isNumber: RuleInstance<number> = {
  run: (v: any) => ({ passes: typeof v === 'number', type: v }),
  infer: {} as number,
};

const isString: RuleInstance<string> = {
  run: (v: any) => ({ passes: typeof v === 'string', type: v }),
  infer: {} as string,
};

describe('isArrayOf', () => {
  it('should return a rule instance', () => {
    const rule = isArrayOf(isNumber);
    expect(rule).toHaveProperty('run');
    expect(rule).toHaveProperty('infer');
  });

  it('should pass for an array of numbers', () => {
    const rule = isArrayOf(isNumber);
    const result = rule.run([1, 2, 3]);
    expect(result.passes).toBe(true);
  });

  it('should fail for an array with mixed types', () => {
    const rule = isArrayOf(isNumber);
    const result = rule.run([1, '2', 3]);
    expect(result.passes).toBe(false);
  });

  it('should pass for an empty array', () => {
    const rule = isArrayOf(isNumber);
    const result = rule.run([]);
    expect(result.passes).toBe(true);
  });

  it('should fail if not an array', () => {
    const rule = isArrayOf(isNumber);
    const result = rule.run({ not: 'an array' });
    expect(result.passes).toBe(false);
  });

  it('should pass for an array of mixed types when multiple rules are provided', () => {
    const rule = isArrayOf(isNumber, isString);
    const result = rule.run([1, '2', 3]);
    expect(result.passes).toBe(true);
  });

  it('should fail for an array of mixed types when a type is not in the rules', () => {
    const rule = isArrayOf(isNumber, isString);
    const result = rule.run([1, '2', true]);
    expect(result.passes).toBe(false);
  });
});