import { enforce } from 'n4s-schema';
import { describe, it, expect } from 'vitest';

// schema combinators are accessed via enforce

describe('optional', () => {
  it('should return a rule instance', () => {
    const rule = enforce.optional(enforce.isNumber());
    expect(rule).toHaveProperty('run');
    expect(rule).toHaveProperty('infer');
  });

  it('should pass for null', () => {
    const rule = enforce.optional(enforce.isNumber());
    const result = rule.run(null);
    expect(result.pass).toBe(true);
  });

  it('should pass for undefined', () => {
    const rule = enforce.optional(enforce.isNumber());
    const result = rule.run(undefined);
    expect(result.pass).toBe(true);
  });

  it('should pass for a valid value', () => {
    const rule = enforce.optional(enforce.isNumber());
    const result = rule.run(123);
    expect(result.pass).toBe(true);
  });

  it('should fail for an invalid value', () => {
    const rule = enforce.optional(enforce.isNumber());
    // @ts-expect-error
    const result = rule.run('not a number');
    expect(result.pass).toBe(false);
  });
});
