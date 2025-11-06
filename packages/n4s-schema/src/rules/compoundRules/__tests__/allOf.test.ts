import { describe, it, expect } from 'vitest';

import { enforce } from 'n4s-schema';

describe('allOf', () => {
  it('should return a rule instance', () => {
    const rule = enforce.allOf(enforce.isNumber());
    expect(rule).toHaveProperty('run');
    expect(rule).toHaveProperty('infer');
  });

  it('should pass if all rules pass', () => {
    const rule = enforce.allOf(
      enforce.isNumber(),
      enforce.isNumber().greaterThan(5),
    );
    const result = rule.run(10);
    expect(result.pass).toBe(true);
  });

  it('should fail if one rule fails', () => {
    const rule = enforce.allOf(
      enforce.isNumber(),
      enforce.isNumber().greaterThan(10),
    );
    const result = rule.run(5);
    expect(result.pass).toBe(false);
  });

  it('should fail if value is of wrong type', () => {
    const rule = enforce.allOf(
      enforce.isNumber(),
      enforce.isNumber().greaterThan(5),
    );
    const result = rule.run('10');
    expect(result.pass).toBe(false);
  });

  it('should pass with no rules', () => {
    const rule = enforce.allOf();
    const result = rule.run('any value');
    expect(result.pass).toBe(true);
  });

  describe('When all rules  are satisfied', () => {
    it('Should return a passing result', () => {
      const rule = enforce.allOf(enforce.isArray());
      const result = rule.run([1, 2, 3]);
      expect(result).toEqual({ pass: true, type: [1, 2, 3] });
    });
  });
});
