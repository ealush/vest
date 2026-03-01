import { describe, expect, it } from 'vitest';

import { enforce } from '../n4s';

describe('built-in lazy parsers', () => {
  it('applies lazy parser chains on top of type checks', () => {
    const transformed = enforce
      .isString()
      .trim()
      .toUpper()
      .prepend('HELLO ')
      .run('  world  ');

    expect(transformed).toMatchObject({ pass: true, type: 'HELLO WORLD' });
  });

  it('supports numeric parser chains after numeric rules', () => {
    const transformed = enforce
      .isNumeric()
      .toNumber()
      .clamp(0, 100)
      .round()
      .run('101.49');

    expect(transformed).toMatchObject({ pass: true, type: 100 });
  });

  it('fails parse-oriented chains when parser coercion fails', () => {
    const toBooleanRule = enforce.isString().trim().toBoolean();

    expect(toBooleanRule.run('unknown')).toEqual({
      pass: false,
      type: false,
      message: 'Could not parse to boolean',
    });

    expect(() => toBooleanRule.parse('unknown')).toThrow(
      'Could not parse to boolean',
    );
  });

  it('keeps parser methods lazy-only and unavailable in eager chains', () => {
    expect(() =>
      (enforce('  hi  ') as Record<string, () => unknown>).trim(),
    ).toThrow();
  });
});
