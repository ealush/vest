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
  it('should return a rule instance', () => {
    const rule = enforce.shape({
      firstName: enforce.isString(),
      lastName: enforce.isString(),
      age: enforce.isNumber(),
    });
    expect(rule).toHaveProperty('run');
    expect(rule).toHaveProperty('infer');
  });

  it('should pass with exact matching object', () => {
    const rule = enforce.shape({
      firstName: enforce.isString(),
      lastName: enforce.isString(),
      age: enforce.isNumber(),
    });
    const result = rule.run({
      firstName: 'Rick',
      lastName: 'Sanchez',
      age: 70,
    });
    expect(result.pass).toBe(true);
  });

  it('should fail with extra properties', () => {
    const rule = enforce.shape({
      firstName: enforce.isString(),
      lastName: enforce.isString(),
      age: enforce.isNumber(),
    });
    // Type test:
    const result = runShapeRule(rule, {
      firstName: 'Rick',
      lastName: 'Sanchez',
      age: 70,
      extra: 'property',
    });
    expect(result.pass).toBe(false);
  });

  it('should fail if a property is missing', () => {
    const rule = enforce.shape({
      firstName: enforce.isString(),
      lastName: enforce.isString(),
      age: enforce.isNumber(),
    });
    // Type test:
    const result = runShapeRule(rule, { firstName: 'Rick' });
    expect(result.pass).toBe(false);
  });

  it('should fail if a property has wrong type', () => {
    const rule = enforce.shape({
      firstName: enforce.isString(),
      lastName: enforce.isString(),
      age: enforce.isNumber(),
    });
    // Type test:
    const result = runShapeRule(rule, {
      firstName: 'Rick',
      lastName: 'Sanchez',
      age: '70',
    });
    expect(result.pass).toBe(false);
  });

  it('should fail with empty object', () => {
    const rule = enforce.shape({
      firstName: enforce.isString(),
      lastName: enforce.isString(),
      age: enforce.isNumber(),
    });
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

  it('should validate nested shapes', () => {
    const rule = enforce.shape({
      user: enforce.shape({
        name: enforce.shape({
          first: enforce.isString(),
          last: enforce.isString(),
        }),
      }),
    });
    const result = rule.run({
      user: { name: { first: 'Joseph', last: 'Weil' } },
    });
    expect(result.pass).toBe(true);
  });

  it('should validate chained rules', () => {
    const rule = enforce.shape({
      age: enforce.isNumber().isBetween(0, 150),
    });
    expect(rule.run({ age: 22 }).pass).toBe(true);
    expect(runShapeRule(rule, { age: 200 }).pass).toBe(false);
  });
});

describe('shape - eager API', () => {
  it('should pass with exact matching object (eager)', () => {
    expect(() => {
      enforce({ firstName: 'Rick', lastName: 'Sanchez', age: 70 }).shape({
        firstName: enforce.isString(),
        lastName: enforce.isString(),
        age: enforce.isNumber(),
      });
    }).not.toThrow();
  });

  it('should fail with extra properties (eager)', () => {
    expect(() => {
      enforce({
        firstName: 'Rick',
        lastName: 'Sanchez',
        age: 70,
        extra: 'property',
      }).shape({
        firstName: enforce.isString(),
        lastName: enforce.isString(),
        age: enforce.isNumber(),
      });
    }).toThrow();
  });

  it('should fail if a property is missing (eager)', () => {
    expect(() => {
      enforce({ firstName: 'Rick' }).shape({
        firstName: enforce.isString(),
        lastName: enforce.isString(),
        age: enforce.isNumber(),
      });
    }).toThrow();
  });

  it('should fail if a property has wrong type (eager)', () => {
    expect(() => {
      enforce({ firstName: 'Rick', lastName: 'Sanchez', age: '70' }).shape({
        firstName: enforce.isString(),
        lastName: enforce.isString(),
        age: enforce.isNumber(),
      });
    }).toThrow();
  });

  it('should validate nested shapes (eager)', () => {
    expect(() => {
      enforce({
        user: { name: { first: 'Joseph', last: 'Weil' } },
      }).shape({
        user: enforce.shape({
          name: enforce.shape({
            first: enforce.isString(),
            last: enforce.isString(),
          }),
        }),
      });
    }).not.toThrow();
  });
});
