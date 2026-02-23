import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { enforce } from '../n4s';

declare global {
  namespace n4s {
    interface EnforceMatchers {
      toNumber: (value: unknown) => { pass: boolean; type: number };
    }
  }
}

describe('parse()', () => {
  let originalToNumber: unknown;

  beforeEach(() => {
    originalToNumber = (enforce as unknown as Record<string, unknown>).toNumber;

    enforce.extend({
      toNumber: (value: unknown) => {
        const parsed = Number(value);
        return Number.isNaN(parsed)
          ? { pass: false, type: value }
          : { pass: true, type: parsed };
      },
    });
  });

  afterEach(() => {
    if (originalToNumber === undefined) {
      delete (enforce as unknown as Record<string, unknown>).toNumber;
      return;
    }

    (enforce as unknown as Record<string, unknown>).toNumber = originalToNumber;
  });

  it('should expose parse on lazy rules', () => {
    const validator = enforce.isString();
    expect(typeof validator.parse).toBe('function');
    expect(validator.parse('hello')).toBe('hello');
  });

  it('should throw on failed parse', () => {
    const validator = enforce.isString().message('Must be string');
    expect(() => validator.parse(100)).toThrow('Must be string');
  });

  it('should return transformed output for schema rules', () => {
    const schema = enforce.shape({
      age: enforce.toNumber(),
    });

    expect(schema.parse({ age: '42' })).toEqual({ age: 42 });
  });

  it('should transform items when used in isArrayOf', () => {
    const schema = enforce.isArrayOf(enforce.toNumber());

    expect(schema.parse(['42', '100', 5])).toEqual([42, 100, 5]);
  });

  it('should throw an error if an item in isArrayOf fails to parse', () => {
    const schema = enforce.isArrayOf(enforce.toNumber());
    expect(() => schema.parse(['42', 'not-a-number'])).toThrow();
  });
});
