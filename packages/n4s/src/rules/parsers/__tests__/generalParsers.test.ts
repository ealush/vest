import { describe, expect, it } from 'vitest';

import { defaultTo, generalParsers, toJSON } from '../generalParsers';

describe('general parsers', () => {
  it('exports all general parser functions', () => {
    expect(Object.keys(generalParsers).sort()).toEqual([
      'defaultTo',
      'toBoolean',
      'toJSON',
    ]);
  });

  it('defaultTo returns fallback for nullish values', () => {
    expect(defaultTo<string | null>(null, 'fallback').type).toBe('fallback');
    expect(defaultTo<number | undefined>(undefined, 42).type).toBe(42);
  });

  it('defaultTo keeps non-nullish values', () => {
    expect(defaultTo('value', 'fallback').type).toBe('value');
  });

  it('toJSON passes for valid JSON', () => {
    expect(toJSON('{"name":"vest"}')).toEqual({
      pass: true,
      type: { name: 'vest' },
      message: undefined,
      path: undefined,
    });
  });

  it('toJSON fails for invalid JSON', () => {
    const result = toJSON('not-json');

    expect(result.pass).toBe(false);
    expect(result.type).toBe('not-json');
    expect(result.message).toBe('Could not parse JSON');
  });
});
