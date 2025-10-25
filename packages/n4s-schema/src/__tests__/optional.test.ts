import { describe, it, expect } from 'vitest';
import { optional } from '../schemaRules';
import { RuleInstance } from '../enforce';

const isNumber: RuleInstance<number> = {
  run: (v: any) => ({ passes: typeof v === 'number', type: v }),
  infer: {} as number,
};

describe('optional', () => {
  it('should return a rule instance', () => {
    const rule = optional(isNumber);
    expect(rule).toHaveProperty('run');
    expect(rule).toHaveProperty('infer');
  });

  it('should pass for null', () => {
    const rule = optional(isNumber);
    const result = rule.run(null);
    expect(result.passes).toBe(true);
  });

  it('should pass for undefined', () => {
    const rule = optional(isNumber);
    const result = rule.run(undefined);
    expect(result.passes).toBe(true);
  });

  it('should pass for a valid value', () => {
    const rule = optional(isNumber);
    const result = rule.run(123);
    expect(result.passes).toBe(true);
  });

  it('should fail for an invalid value', () => {
    const rule = optional(isNumber);
    const result = rule.run('not a number');
    expect(result.passes).toBe(false);
  });
});