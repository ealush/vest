import { describe, it, expect } from 'vitest';

import { enforce } from 'n4s-schema';

describe('isArrayOf', () => {
  it('should return a rule instance', () => {
    const rule = enforce.isArrayOf(enforce.isNumber());
    expect(rule).toHaveProperty('run');
    expect(rule).toHaveProperty('infer');
  });

  it('should pass for an array of numbers', () => {
    const rule = enforce.isArrayOf(enforce.isNumber());
    const result = rule.run([1, 2, 3]);
    expect(result.pass).toBe(true);
  });

  it('should fail for an array with mixed types', () => {
    const rule = enforce.isArrayOf(enforce.isNumber());
    // @ts-expect-error
    const result = rule.run([1, '2', 3]);
    expect(result.pass).toBe(false);
  });

  it('should pass for an empty array', () => {
    const rule = enforce.isArrayOf(enforce.isNumber());
    const result = rule.run([]);
    expect(result.pass).toBe(true);
  });

  it('should fail if not an array', () => {
    const rule = enforce.isArrayOf(enforce.isNumber());
    // @ts-expect-error
    const result = rule.run({ not: 'an array' });
    expect(result.pass).toBe(false);
  });

  it('should pass for an array of mixed types when multiple rules are provided', () => {
    const rule = enforce.isArrayOf(enforce.isNumber(), enforce.isString());
    const result = rule.run([1, '2', 3]);
    expect(result.pass).toBe(true);
  });

  it('should fail for an array of mixed types when a type is not in the rules', () => {
    const rule = enforce.isArrayOf(enforce.isNumber(), enforce.isString());
    // @ts-expect-error
    const result = rule.run([1, '2', true]);
    expect(result.pass).toBe(false);
  });
});
