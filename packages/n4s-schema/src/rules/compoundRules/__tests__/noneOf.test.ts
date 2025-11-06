import { describe, it, expect } from 'vitest';

import { enforce } from 'n4s-schema';

describe('noneOf', () => {
  it('should return a rule instance', () => {
    const rule = enforce.noneOf(enforce.isNumber());
    expect(rule).toHaveProperty('run');
    expect(rule).toHaveProperty('infer');
  });

  it('should pass if no rules pass', () => {
    const rule = enforce.noneOf(
      enforce.isNumber(),
      enforce.isNumber().greaterThan(10),
    );
    const result = rule.run('a string');
    expect(result.pass).toBe(true);
  });

  it('should fail if any rule pass', () => {
    const rule = enforce.noneOf(
      enforce.isNumber(),
      enforce.isNumber().greaterThan(10),
    );
    expect(rule.run(5).pass).toBe(false); // isNumber pass
    expect(rule.run(12).pass).toBe(false); // isNumber and isGreaterThan(10) pass
    expect(rule.run('a string').pass).toBe(true);
  });

  it('should pass with no rules', () => {
    const rule = enforce.noneOf();
    const result = rule.run('any value');
    expect(result.pass).toBe(true);
  });
});
