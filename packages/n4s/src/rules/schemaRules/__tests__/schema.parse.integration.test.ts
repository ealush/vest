import { describe, expect, it } from 'vitest';

import { enforce } from '../../../n4s';

declare global {
  namespace n4s {
    interface EnforceMatchers {
      toNumber: (value: unknown) => { pass: boolean; type: unknown };
      trimString: (value: unknown) => { pass: boolean; type: unknown };
    }
  }
}

enforce.extend({
  toNumber: (value: unknown) => {
    const parsed = Number(value);
    return Number.isNaN(parsed)
      ? { pass: false, type: value }
      : { pass: true, type: parsed };
  },
  trimString: (value: unknown) => {
    if (typeof value !== 'string') {
      return { pass: false, type: value };
    }

    return { pass: true, type: value.trim() };
  },
});

describe('schema parse integration', () => {
  it('shape parses nested values with custom coercions', () => {
    const schema = enforce.shape({
      profile: enforce.shape({
        name: enforce.trimString(),
        age: enforce.toNumber(),
      }),
    });

    const result = schema.parse({
      profile: { name: '  Jane  ', age: '34' },
    });

    expect(result).toEqual({
      profile: { name: 'Jane', age: 34 },
    });
  });

  it('loose parses known keys while keeping extra payload fields', () => {
    const schema = enforce.loose({
      amount: enforce.toNumber(),
      title: enforce.trimString(),
    });

    const result = schema.parse({
      amount: '49',
      title: '  invoice ',
      metadata: { source: 'api' },
    });

    expect(result).toEqual({
      amount: 49,
      title: 'invoice',
      metadata: { source: 'api' },
    });
  });

  it('partial parses only provided keys', () => {
    const schema = enforce.partial({
      page: enforce.toNumber(),
      search: enforce.trimString(),
    });

    expect(schema.parse({ page: '2' })).toEqual({ page: 2 });
    expect(schema.parse({ search: '  vest  ' })).toEqual({ search: 'vest' });
  });

  it('rejects dangerous own keys to prevent prototype pollution', () => {
    const schema = enforce.loose({
      safe: enforce.isString(),
    });

    const payload = JSON.parse('{"safe":"ok","__proto__":{"polluted":true}}');
    const result = schema.run(payload);

    expect(result.pass).toBe(false);
    expect(result.path).toEqual(['__proto__']);
    expect(({} as any).polluted).toBeUndefined();
  });

  it('rejects dangerous schema keys', () => {
    const schema = enforce.shape(
      JSON.parse('{"__proto__":true}') as Record<string, unknown> as any,
    );

    const result = schema.run({});

    expect(result.pass).toBe(false);
    expect(result.path).toEqual(['__proto__']);
  });
});
