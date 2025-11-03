import { describe, it, expect, expectTypeOf } from 'vitest';

import { enforceLazy } from 'lazy';

describe('anyOf', () => {
  it('should return a rule instance', () => {
    const rule = enforceLazy.anyOf(enforceLazy.isNumber());
    expect(rule).toHaveProperty('run');
    expect(rule).toHaveProperty('infer');
  });

  it('should pass if at least one rule pass', () => {
    const rule = enforceLazy.anyOf(
      enforceLazy.isString(),
      enforceLazy.isNumber().greaterThan(10),
    );
    expect(rule.run(5).pass).toBe(false);
    expect(rule.run(15).pass).toBe(true);
    expect(rule.run('hello').pass).toBe(true);
  });

  it('should infer a union of rule input types', () => {
    const rule = enforceLazy.anyOf(
      enforceLazy.isString(),
      enforceLazy.isNumber().greaterThan(10),
    );

    expectTypeOf(rule.infer).toEqualTypeOf<string | number>();
    expectTypeOf(rule.run).parameter(0).toEqualTypeOf<string | number>();
    expect(rule).toBeDefined();
  });

  it('should fail if all rules fail', () => {
    const rule = enforceLazy.anyOf(
      enforceLazy.isString(),
      enforceLazy.isNumber().greaterThan(10),
    );
    const result = rule.run(5);
    expect(result.pass).toBe(false);
  });

  it('should fail with no rules', () => {
    const rule = enforceLazy.anyOf();
    const result = rule.run('any value');
    expect(result.pass).toBe(false);
  });
});
