import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('noneOf', () => {
  it('should return a rule instance', () => {
    const rule = enforceLazy.noneOf(enforceLazy.isNumber());
    expect(rule).toHaveProperty('run');
    expect(rule).toHaveProperty('infer');
  });

  it('should pass if no rules pass', () => {
    const rule = enforceLazy.noneOf(
      enforceLazy.isNumber(),
      enforceLazy.isNumber().greaterThan(10),
    );
    const result = rule.run('a string');
    expect(result.pass).toBe(true);
  });

  it('should fail if any rule pass', () => {
    const rule = enforceLazy.noneOf(
      enforceLazy.isNumber(),
      enforceLazy.isNumber().greaterThan(10),
    );
    expect(rule.run(5).pass).toBe(false); // isNumber pass
    expect(rule.run(12).pass).toBe(false); // isNumber and isGreaterThan(10) pass
    expect(rule.run('a string').pass).toBe(true);
  });

  it('should pass with no rules', () => {
    const rule = enforceLazy.noneOf();
    const result = rule.run('any value');
    expect(result.pass).toBe(true);
  });
});
