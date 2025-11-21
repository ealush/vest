import { describe, it, expect } from 'vitest';

import { enforce } from '../../../n4s';

const runArrayRule = <TRule extends { run: (...args: any[]) => any }>(
  rule: TRule,
  value: unknown,
) => (rule as TRule & { run: (value: unknown) => ReturnType<TRule['run']> }).run(value);

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
    // Type test:
    const result = runArrayRule(rule, [1, '2', 3]);
    expect(result.pass).toBe(false);
  });

  it('should pass for an empty array', () => {
    const rule = enforce.isArrayOf(enforce.isNumber());
    const result = rule.run([]);
    expect(result.pass).toBe(true);
  });

  it('should fail if not an array', () => {
    const rule = enforce.isArrayOf(enforce.isNumber());
    // Type test:
    const result = runArrayRule(rule, { not: 'an array' });
    expect(result.pass).toBe(false);
  });

  it('should pass for an array of mixed types when multiple rules are provided', () => {
    const rule = enforce.isArrayOf(enforce.isNumber(), enforce.isString());
    const result = rule.run([1, '2', 3]);
    expect(result.pass).toBe(true);
  });

  it('should fail for an array of mixed types when a type is not in the rules', () => {
    const rule = enforce.isArrayOf(enforce.isNumber(), enforce.isString());
    // Type test:
    const result = runArrayRule(rule, [1, '2', true]);
    expect(result.pass).toBe(false);
  });

  it('should chain array methods after isArrayOf (lazy API)', () => {
    const rule = enforce
      .isArrayOf(enforce.isNumber())
      .minLength(1)
      .maxLength(10);

    expect(rule.run([1, 2, 3])).toMatchObject({ pass: true });
    expect(rule.run([])).toMatchObject({ pass: false }); // fails minLength
    expect(rule.run([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])).toMatchObject({
      pass: false,
    }); // fails maxLength
  });
});

describe('isArrayOf - eager API', () => {
  it('should chain array methods after isArrayOf (eager API)', () => {
    expect(() => {
      enforce([1, 2, 3]).isArrayOf(enforce.isNumber()).minLength(1);
    }).not.toThrow();

    expect(() => {
      enforce([]).isArrayOf(enforce.isNumber()).minLength(1);
    }).toThrow();

    expect(() => {
      enforce([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
        .isArrayOf(enforce.isNumber())
        .maxLength(10);
    }).toThrow();
  });
});
