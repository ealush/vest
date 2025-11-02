import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('isArrayOf', () => {
  it('should return a rule instance', () => {
    const rule = enforceLazy.isArrayOf(enforceLazy.isNumber());
    expect(rule).toHaveProperty('run');
    expect(rule).toHaveProperty('infer');
  });

  it('should pass for an array of numbers', () => {
    const rule = enforceLazy.isArrayOf(enforceLazy.isNumber());
    const result = rule.run([1, 2, 3]);
    expect(result.pass).toBe(true);
  });

  it('should fail for an array with mixed types', () => {
    const rule = enforceLazy.isArrayOf(enforceLazy.isNumber());
    // @ts-expect-error
    const result = rule.run([1, '2', 3]);
    expect(result.pass).toBe(false);
  });

  it('should pass for an empty array', () => {
    const rule = enforceLazy.isArrayOf(enforceLazy.isNumber());
    const result = rule.run([]);
    expect(result.pass).toBe(true);
  });

  it('should fail if not an array', () => {
    const rule = enforceLazy.isArrayOf(enforceLazy.isNumber());
    // @ts-expect-error
    const result = rule.run({ not: 'an array' });
    expect(result.pass).toBe(false);
  });

  it('should pass for an array of mixed types when multiple rules are provided', () => {
    const rule = enforceLazy.isArrayOf(
      enforceLazy.isNumber(),
      enforceLazy.isString(),
    );
    const result = rule.run([1, '2', 3]);
    expect(result.pass).toBe(true);
  });

  it('should fail for an array of mixed types when a type is not in the rules', () => {
    const rule = enforceLazy.isArrayOf(
      enforceLazy.isNumber(),
      enforceLazy.isString(),
    );
    // @ts-expect-error
    const result = rule.run([1, '2', true]);
    expect(result.pass).toBe(false);
  });
});
