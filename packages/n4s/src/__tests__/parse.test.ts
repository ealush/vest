import { describe, expect, it } from 'vitest';

import { enforce } from '../n4s';

declare global {
  namespace n4s {
    interface EnforceMatchers {
      toNumber: (value: unknown) => { pass: boolean; type: unknown };
    }
  }
}

describe('parse()', () => {
  it('should expose parse on lazy rules', () => {
    const validator = enforce.isString();
    expect(typeof validator.parse).toBe('function');
    expect(validator.parse('hello')).toBe('hello');
  });

  it('should throw on failed parse', () => {
    const validator = enforce.isString().message('Must be string');
    expect(() => validator.parse(100 as any)).toThrow('Must be string');
  });

  it('should return transformed output for schema rules', () => {
    enforce.extend({
      toNumber: (value: unknown) => {
        const parsed = Number(value);
        return Number.isNaN(parsed)
          ? { pass: false, type: value }
          : { pass: true, type: parsed };
      },
    });

    const schema = enforce.shape({
      age: enforce.toNumber(),
    });

    expect(schema.parse({ age: '42' })).toEqual({ age: 42 });
  });
});
