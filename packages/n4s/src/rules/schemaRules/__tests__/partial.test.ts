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
      types: { input: undefined, output: undefined as any },
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
  it('validates subset; empty object is allowed', () => {
    const rule = enforce.partial({
      firstName: enforce.isString(),
      lastName: enforce.isString(),
    });

    expect(rule.run({ firstName: 'Rick' }).pass).toBe(true);
    expect(rule.run({ lastName: 'Sanchez' }).pass).toBe(true);
    expect(rule.run({ firstName: 'Rick', lastName: 'Sanchez' }).pass).toBe(
      true,
    );
    expect(rule.run({}).pass).toBe(true);
  });

  it('disallows extra properties', () => {
    const rule = enforce.partial({
      firstName: enforce.isString(),
      lastName: enforce.isString(),
    });
    // Type test: runtime check for extra property
    expect(runPartialRule(rule, { firstName: 'Rick', extra: true }).pass).toBe(
      false,
    );
  });

  it('fails when object has none of the original fields', () => {
    const rule = enforce.partial({
      firstName: enforce.isString(),
      lastName: enforce.isString(),
    });
    // none of the keys match schema, should fail
    // Type test: runtime check for unrelated fields
    expect(runPartialRule(rule, { foo: 'bar' }).pass).toBe(false);
  });

  it('fails when provided field has wrong type', () => {
    const rule = enforce.partial({
      firstName: enforce.isString(),
      lastName: enforce.isString(),
    });
    // Type test: runtime check for wrong type
    expect(runPartialRule(rule, { firstName: 123 }).pass).toBe(false);
    // Type test: runtime check for wrong type
    expect(runPartialRule(rule, { lastName: 42 }).pass).toBe(false);
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
  it('should pass with subset of properties (eager)', () => {
    expect(() => {
      enforce({ firstName: 'Rick' }).partial({
        firstName: enforce.isString(),
        lastName: enforce.isString(),
      });
    }).not.toThrow();

    expect(() => {
      enforce({ lastName: 'Sanchez' }).partial({
        firstName: enforce.isString(),
        lastName: enforce.isString(),
      });
    }).not.toThrow();

    expect(() => {
      enforce({ firstName: 'Rick', lastName: 'Sanchez' }).partial({
        firstName: enforce.isString(),
        lastName: enforce.isString(),
      });
    }).not.toThrow();
  });

  it('should pass with empty object (eager)', () => {
    expect(() => {
      enforce({}).partial({
        firstName: enforce.isString(),
        lastName: enforce.isString(),
      });
    }).not.toThrow();
  });

  it('should fail with extra properties (eager)', () => {
    expect(() => {
      enforce({ firstName: 'Rick', extra: true }).partial({
        firstName: enforce.isString(),
        lastName: enforce.isString(),
      });
    }).toThrow();
  });

  it('should fail when provided field has wrong type (eager)', () => {
    expect(() => {
      enforce({ firstName: 123 }).partial({
        firstName: enforce.isString(),
        lastName: enforce.isString(),
      });
    }).toThrow();

    expect(() => {
      enforce({ lastName: 42 }).partial({
        firstName: enforce.isString(),
        lastName: enforce.isString(),
      });
    }).toThrow();
  });
});
