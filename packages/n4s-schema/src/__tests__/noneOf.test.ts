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
    expect(result.passes).toBe(true);
  });

  it('should fail if any rule passes', () => {
    const rule = enforceLazy.noneOf(
      enforceLazy.isNumber(),
      enforceLazy.isNumber().greaterThan(10),
    );
    expect(rule.run(5).passes).toBe(false); // isNumber passes
    expect(rule.run(12).passes).toBe(false); // isNumber and isGreaterThan(10) pass
    expect(rule.run('a string').passes).toBe(true);
  });

  it('should pass with no rules', () => {
    const rule = enforceLazy.noneOf();
    const result = rule.run('any value');
    expect(result.passes).toBe(true);
  });
});
