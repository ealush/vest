import { describe, it, expect } from 'vitest';

import { enforce } from '../../../n4s';
import { RuleInstance } from '../../../utils/RuleInstance';

const longerThan = (n: number): RuleInstance<string> =>
  ({
    run: (v: any) => ({ pass: typeof v === 'string' && v.length > n, type: v }),
    test: (v: any) => typeof v === 'string' && v.length > n,
    validate: (v: any) => {
      const pass = typeof v === 'string' && v.length > n;
      return pass
        ? { value: v }
        : { issues: [{ message: 'Validation failed', path: [] }] };
    },
    '~standard': {
      version: 1 as const,
      vendor: 'n4s',
      validate: (v: any) => {
        const pass = typeof v === 'string' && v.length > n;
        return pass
          ? { value: v }
          : { issues: [{ message: 'Validation failed', path: [] }] };
      },
      types: { input: undefined as any, output: undefined as any },
    },
    infer: {} as string,
  }) as any;

const runPartialRule = <TRule extends { run: (..._args: any[]) => any }>(
  rule: TRule,
  value: unknown,
) =>
  (rule as TRule & { run: (_value: unknown) => ReturnType<TRule['run']> }).run(
    value,
  );

describe('partial', () => {
  const schema = {
    name: enforce.isString(),
    age: enforce.isNumber(),
  };

  it('validates subset; empty object is allowed', () => {
    const rule = enforce.partial(schema);

    expect(rule.run({ name: 'John' }).pass).toBe(true);
    expect(rule.run({ age: 30 }).pass).toBe(true);
    expect(rule.run({ name: 'John', age: 30 }).pass).toBe(true);
    expect(rule.run({}).pass).toBe(true);
  });

  it('disallows extra properties', () => {
    const rule = enforce.partial(schema);
    // Type test: runtime check for extra property
    expect(runPartialRule(rule, { name: 'John', extra: true }).pass).toBe(
      false,
    );
  });

  it('fails when object has none of the original fields', () => {
    const rule = enforce.partial(schema);
    // none of the keys match schema, should fail
    // Type test: runtime check for unrelated fields
    expect(runPartialRule(rule, { foo: 'bar' }).pass).toBe(false);
  });

  it('fails when provided field has wrong type', () => {
    const rule = enforce.partial(schema);
    // Type test: runtime check for wrong type
    expect(runPartialRule(rule, { name: 123 }).pass).toBe(false);
    // Type test: runtime check for wrong type
    expect(runPartialRule(rule, { age: '30' }).pass).toBe(false);
  });

  it('works with custom rules', () => {
    const rule = enforce.partial({
      username: longerThan(3),
      id: enforce.isNumber(),
    });

    expect(rule.run({ username: 'foobar' }).pass).toBe(true);
    expect(rule.run({ id: 1 }).pass).toBe(true);
    expect(rule.run({ username: 'foo' }).pass).toBe(false);
    // Type test:
    expect(runPartialRule(rule, { id: '1' }).pass).toBe(false);
  });
});

describe('partial - eager API', () => {
  const schema = {
    name: enforce.isString(),
    age: enforce.isNumber(),
  };

  it('should pass with subset of properties (eager)', () => {
    expect(() => {
      enforce({ name: 'John' }).partial(schema);
    }).not.toThrow();

    expect(() => {
      enforce({ age: 30 }).partial(schema);
    }).not.toThrow();

    expect(() => {
      enforce({ name: 'John', age: 30 }).partial(schema);
    }).not.toThrow();
  });

  it('should pass with empty object (eager)', () => {
    expect(() => {
      enforce({}).partial(schema);
    }).not.toThrow();
  });

  it('should fail with extra properties (eager)', () => {
    expect(() => {
      enforce({ name: 'John', extra: true }).partial(schema);
    }).toThrow();
  });

  it('should fail when provided field has wrong type (eager)', () => {
    expect(() => {
      enforce({ name: 123 }).partial(schema);
    }).toThrow();

    expect(() => {
      enforce({ age: '30' }).partial(schema);
    }).toThrow();
  });
});
