import { describe, expect, it } from 'vitest';

import { defaultTo, generalParsers, parseJSON } from '../generalParsers';

describe('general parsers', () => {
  it('exports all general parser functions', () => {
    expect(Object.keys(generalParsers).sort()).toEqual([
      'defaultTo',
      'parseJSON',
      'toBoolean',
    ]);
  });

  it('defaultTo returns fallback for nullish values', () => {
    expect(defaultTo<string | null>(null, 'fallback').type).toBe('fallback');
    expect(defaultTo<number | undefined>(undefined, 42).type).toBe(42);
  });

  it('defaultTo keeps non-nullish values', () => {
    expect(defaultTo('value', 'fallback').type).toBe('value');
  });

  it('parseJSON passes for valid JSON', () => {
    expect(parseJSON('{"name":"vest"}')).toEqual({
      pass: true,
      type: { name: 'vest' },
      message: undefined,
      path: undefined,
    });
  });

  it('parseJSON fails for invalid JSON', () => {
    const result = parseJSON('not-json');

    expect(result.pass).toBe(false);
    expect(result.type).toBe('not-json');
    expect(result.message).toBe('Could not parse JSON');
  });
});
