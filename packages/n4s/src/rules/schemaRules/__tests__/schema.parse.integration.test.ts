import { describe, expect, it } from 'vitest';

import { enforce } from '../../../n4s';
import type { RuleInstance } from '../../../utils/RuleInstance';

declare global {
  namespace n4s {
    interface EnforceMatchers {
      toNumber: (value: unknown) => { pass: boolean; type: number };
      trimString: (value: unknown) => { pass: boolean; type: string };
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
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });

  it('rejects dangerous schema keys', () => {
    const schema = enforce.shape(JSON.parse('{"__proto__":true}'));

    const result = schema.run({});

    expect(result.pass).toBe(false);
    expect(result.path).toEqual(['__proto__']);
  });

  it('isArrayOf parses array elements and preserves type transformations', () => {
    const schema = enforce.isArrayOf(
      enforce.shape({
        name: enforce.trimString(),
        age: enforce.toNumber(),
      }),
    );

    const result = schema.parse([
      { name: '  Jane  ', age: '34' },
      { name: ' John ', age: '45' },
    ]);

    expect(result).toEqual([
      { name: 'Jane', age: 34 },
      { name: 'John', age: 45 },
    ]);
  });

  it('shape parses values with built-in lazy parser chains', () => {
    const schema = enforce.shape({
      name: enforce.isString().trim().toTitle(),
      age: enforce.isNumeric().toNumber().clamp(0, 120),
      subscribed: enforce.isString().trim().toBoolean(),
      tags: enforce.isArray<string>().uniq().join('|'),
      payload: enforce.isString().parseJSON(),
      nickname: enforce.isString().trim().defaultTo('N/A'),
    });

    const result = schema.parse({
      name: '  jANE DOE ',
      age: '180',
      subscribed: ' yes ',
      tags: ['vest', 'n4s', 'vest'],
      payload: '{"env":"test"}',
      nickname: '   ',
    });

    expect(result).toEqual({
      name: 'Jane Doe',
      age: 120,
      subscribed: true,
      tags: 'vest|n4s',
      payload: { env: 'test' },
      nickname: '',
    });
  });

  it('defaultTo applies fallback for nullish values before type checks', () => {
    const schema = enforce.shape({
      label: enforce.isString().defaultTo('N/A'),
    });

    // @ts-expect-error - testing nullish input against string schema
    expect(schema.parse({ label: null })).toEqual({ label: 'N/A' });
    // @ts-expect-error - testing nullish input against string schema
    expect(schema.parse({ label: undefined })).toEqual({ label: 'N/A' });
    expect(schema.parse({ label: 'hello' })).toEqual({ label: 'hello' });
  });

  it('lazy propagates parse transformations from inner schema', () => {
    const inner = enforce.shape({
      name: enforce.trimString(),
      age: enforce.toNumber(),
    });

    const schema = enforce.lazy(() => inner);
    // @ts-expect-error - input type differs from output due to coercions
    const result = schema.parse({ name: '  Jane  ', age: '34' });
    expect(result).toEqual({ name: 'Jane', age: 34 });
  });

  it('lazy propagates parse transformations through recursive schemas', () => {
    const schema: RuleInstance<any> = enforce.shape({
      name: enforce.trimString(),
      children: enforce.isArrayOf(enforce.lazy(() => schema)),
    });

    const result = schema.parse({
      name: '  Root  ',
      children: [
        {
          name: '  Child  ',
          children: [{ name: '  Grandchild  ', children: [] }],
        },
      ],
    });

    expect(result).toEqual({
      name: 'Root',
      children: [
        {
          name: 'Child',
          children: [{ name: 'Grandchild', children: [] }],
        },
      ],
    });
  });
});
