import { describe, it, expect } from 'vitest';

import { enforceLazy } from '../lazy';

describe('oneOf', () => {
  it('should return a rule instance', () => {
    const rule = enforceLazy.oneOf(enforceLazy.isNumber());
    expect(rule).toHaveProperty('run');
    expect(rule).toHaveProperty('infer');
  });

  it('should pass if exactly one rule passes', () => {
    const rule = enforceLazy.oneOf(
      enforceLazy.isNumber().greaterThan(10),
      enforceLazy.isNumber().lessThan(5),
    );
    expect(rule.run(12).passes).toBe(true);
    expect(rule.run(3).passes).toBe(true);
  });

  it('should fail if more than one rule passes', () => {
    const rule = enforceLazy.oneOf(
      enforceLazy.isNumber().greaterThan(5),
      enforceLazy.isNumber().greaterThan(10),
    );
    const result = rule.run(12);
    expect(result.passes).toBe(false);
  });

  it('should fail if no rules pass', () => {
    const rule = enforceLazy.oneOf(
      enforceLazy.isNumber().greaterThan(10),
      enforceLazy.isNumber().lessThan(5),
    );
    const result = rule.run(7);
    expect(result.passes).toBe(false);
  });

  it('should fail with no rules', () => {
    const rule = enforceLazy.oneOf();
    const result = rule.run('any value');
    expect(result.passes).toBe(false);
  });
});
