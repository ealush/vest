import { describe, it, expect, expectTypeOf } from 'vitest';

import { enforce } from 'n4s-schema';

describe('anyOf', () => {
  it('should return a rule instance', () => {
    const rule = enforce.anyOf(enforce.isNumber());
    expect(rule).toHaveProperty('run');
    expect(rule).toHaveProperty('infer');
  });

  it('should pass if at least one rule pass', () => {
    const rule = enforce.anyOf(
      enforce.isString(),
      enforce.isNumber().greaterThan(10),
    );
    expect(rule.run(5).pass).toBe(false);
    expect(rule.run(15).pass).toBe(true);
    expect(rule.run('hello').pass).toBe(true);
  });

  it('should infer a union of rule input types', () => {
    const rule = enforce.anyOf(
      enforce.isString(),
      enforce.isNumber().greaterThan(10),
    );

    expectTypeOf(rule.infer).toEqualTypeOf<string | number>();
    expectTypeOf(rule.run).parameter(0).toEqualTypeOf<string | number>();
    expect(rule).toBeDefined();
  });

  it('should fail if all rules fail', () => {
    const rule = enforce.anyOf(
      enforce.isString(),
      enforce.isNumber().greaterThan(10),
    );
    const result = rule.run(5);
    expect(result.pass).toBe(false);
  });

  it('should fail with no rules', () => {
    const rule = enforce.anyOf();
    const result = rule.run('any value');
    expect(result.pass).toBe(false);
  });
});

describe('anyOf - eager API', () => {
  it('should pass if at least one rule passes (eager)', () => {
    expect(() => {
      enforce(15).anyOf(enforce.isString(), enforce.isNumber().greaterThan(10));
    }).not.toThrow();

    expect(() => {
      enforce('hello').anyOf(
        enforce.isString(),
        enforce.isNumber().greaterThan(10),
      );
    }).not.toThrow();
  });

  it('should fail if all rules fail (eager)', () => {
    expect(() => {
      enforce(5).anyOf(enforce.isString(), enforce.isNumber().greaterThan(10));
    }).toThrow();
  });

  it('should fail with no rules (eager)', () => {
    expect(() => {
      enforce('any value').anyOf();
    }).toThrow();
  });
});
