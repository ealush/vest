import { describe, it, expect } from 'vitest';

import { enforce } from '../../../n4s';

describe('oneOf', () => {
  it('should return a rule instance', () => {
    const rule = enforce.oneOf(enforce.isNumber());
    expect(rule).toHaveProperty('run');
    expect(rule).toHaveProperty('infer');
  });

  it('should pass if exactly one rule pass', () => {
    const rule = enforce.oneOf(
      enforce.isNumber().greaterThan(10),
      enforce.isNumber().lessThan(5),
    );
    expect(rule.run(12).pass).toBe(true);
    expect(rule.run(3).pass).toBe(true);
  });

  it('should fail if more than one rule pass', () => {
    const rule = enforce.oneOf(
      enforce.isNumber().greaterThan(5),
      enforce.isNumber().greaterThan(10),
    );
    const result = rule.run(12);
    expect(result.pass).toBe(false);
  });

  it('should fail if no rules pass', () => {
    const rule = enforce.oneOf(
      enforce.isNumber().greaterThan(10),
      enforce.isNumber().lessThan(5),
    );
    const result = rule.run(7);
    expect(result.pass).toBe(false);
  });

  it('should fail with no rules', () => {
    const rule = enforce.oneOf();
    // @ts-expect-error - Testing invalid input with no rules
    const result = rule.run('any value');
    expect(result.pass).toBe(false);
  });
});

describe('oneOf - eager API', () => {
  it('should pass if exactly one rule passes (eager)', () => {
    expect(() => {
      enforce(12).oneOf(
        enforce.isNumber().greaterThan(10),
        enforce.isNumber().lessThan(5),
      );
    }).not.toThrow();

    expect(() => {
      enforce(3).oneOf(
        enforce.isNumber().greaterThan(10),
        enforce.isNumber().lessThan(5),
      );
    }).not.toThrow();
  });

  it('should fail if more than one rule passes (eager)', () => {
    expect(() => {
      enforce(12).oneOf(
        enforce.isNumber().greaterThan(5),
        enforce.isNumber().greaterThan(10),
      );
    }).toThrow();
  });

  it('should fail if no rules pass (eager)', () => {
    expect(() => {
      enforce(7).oneOf(
        enforce.isNumber().greaterThan(10),
        enforce.isNumber().lessThan(5),
      );
    }).toThrow();
  });

  it('should fail with no rules (eager)', () => {
    expect(() => {
      enforce('any value').oneOf();
    }).toThrow();
  });
});
