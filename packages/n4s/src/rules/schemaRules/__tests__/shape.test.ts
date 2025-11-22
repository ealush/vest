import { describe, it, expect } from 'vitest';

import { enforce } from '../../../n4s';

const runShapeRule = <TRule extends { run: (..._args: any[]) => any }>(
  rule: TRule,
  value: unknown,
) =>
  (rule as TRule & { run: (_value: unknown) => ReturnType<TRule['run']> }).run(
    value,
  );

describe('shape', () => {
  const schema = {
    name: enforce.isString(),
    age: enforce.isNumber(),
  };

  it('should return a rule instance', () => {
    const rule = enforce.shape(schema);
    expect(rule).toHaveProperty('run');
    expect(rule).toHaveProperty('infer');
  });

  it('should pass with exact matching object', () => {
    const rule = enforce.shape(schema);
    const result = rule.run({ name: 'John', age: 30 });
    expect(result.pass).toBe(true);
  });

  it('should fail with extra properties', () => {
    const rule = enforce.shape(schema);
    // Type test:
    const result = runShapeRule(rule, {
      name: 'John',
      age: 30,
      extra: 'property',
    });
    expect(result.pass).toBe(false);
  });

  it('should fail if a property is missing', () => {
    const rule = enforce.shape(schema);
    // Type test:
    const result = runShapeRule(rule, { name: 'John' });
    expect(result.pass).toBe(false);
  });

  it('should fail if a property has wrong type', () => {
    const rule = enforce.shape(schema);
    // Type test:
    const result = runShapeRule(rule, { name: 'John', age: '30' });
    expect(result.pass).toBe(false);
  });

  it('should fail with empty object', () => {
    const rule = enforce.shape(schema);
    // Type test:
    const result = runShapeRule(rule, {});
    expect(result.pass).toBe(false);
  });

  it('should pass with an empty schema and empty object', () => {
    const rule = enforce.shape({});
    const result = rule.run({});
    expect(result.pass).toBe(true);
  });

  it('should fail with an empty schema and non-empty object', () => {
    const rule = enforce.shape({});
    const result = runShapeRule(rule, { any: 'value' });
    expect(result.pass).toBe(false);
  });
});

describe('shape - eager API', () => {
  const schema = {
    name: enforce.isString(),
    age: enforce.isNumber(),
  };

  it('should pass with exact matching object (eager)', () => {
    expect(() => {
      enforce({ name: 'John', age: 30 }).shape(schema);
    }).not.toThrow();
  });

  it('should fail with extra properties (eager)', () => {
    expect(() => {
      enforce({ name: 'John', age: 30, extra: 'property' }).shape(schema);
    }).toThrow();
  });

  it('should fail if a property is missing (eager)', () => {
    expect(() => {
      enforce({ name: 'John' }).shape(schema);
    }).toThrow();
  });

  it('should fail if a property has wrong type (eager)', () => {
    expect(() => {
      enforce({ name: 'John', age: '30' }).shape(schema);
    }).toThrow();
  });
});
