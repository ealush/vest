import { describe, it, expect } from 'vitest';

import { enforce } from '../../../n4s';

const runLooseRule = <TRule extends { run: (...args: any[]) => any }>(
  rule: TRule,
  value: unknown,
) =>
  (rule as TRule & { run: (value: unknown) => ReturnType<TRule['run']> }).run(
    value,
  );

describe('loose', () => {
  it('should return a rule instance', () => {
    const rule = enforce.loose({
      name: enforce.isString(),
    });
    expect(rule).toHaveProperty('run');
    expect(rule).toHaveProperty('infer');
  });

  it('should pass with exact matching object', () => {
    const rule = enforce.loose({
      name: enforce.isString(),
    });
    const result = rule.run({ name: 'Laura' });
    expect(result.pass).toBe(true);
  });

  it('should pass with extra properties', () => {
    const rule = enforce.loose({
      name: enforce.isString(),
    });
    const result = rule.run({ name: 'Laura', code: 'x23' });
    expect(result.pass).toBe(true);
  });

  it('should fail if a property is missing', () => {
    const rule = enforce.loose({
      name: enforce.isString(),
    });
    // Type test:
    const result = runLooseRule(rule, { code: 'x23' });
    expect(result.pass).toBe(false);
  });

  it('should fail if a property has wrong type', () => {
    const rule = enforce.loose({
      name: enforce.isString(),
    });
    // Type test:
    const result = runLooseRule(rule, { name: 123 });
    expect(result.pass).toBe(false);
  });

  it('should fail with empty object', () => {
    const rule = enforce.loose({
      name: enforce.isString(),
    });
    // Type test:
    const result = runLooseRule(rule, {});
    expect(result.pass).toBe(false);
  });

  it('should pass with an empty schema', () => {
    const rule = enforce.loose({});
    const result = rule.run({ any: 'value' });
    expect(result.pass).toBe(true);
  });
});

describe('loose - eager API', () => {
  it('should pass with exact matching object (eager)', () => {
    expect(() => {
      enforce({ name: 'Laura' }).loose({
        name: enforce.isString(),
      });
    }).not.toThrow();
  });

  it('should pass with extra properties (eager)', () => {
    expect(() => {
      enforce({ name: 'Laura', code: 'x23' }).loose({
        name: enforce.isString(),
      });
    }).not.toThrow();
  });

  it('should fail if a property is missing (eager)', () => {
    expect(() => {
      enforce({ code: 'x23' }).loose({
        name: enforce.isString(),
      });
    }).toThrow();
  });

  it('should fail if a property has wrong type (eager)', () => {
    expect(() => {
      enforce({ name: 123 }).loose({
        name: enforce.isString(),
      });
    }).toThrow();
  });
});
