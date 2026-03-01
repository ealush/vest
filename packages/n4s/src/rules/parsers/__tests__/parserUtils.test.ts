import { describe, expect, it } from 'vitest';

import { mapPassing } from '../parserUtils';

describe('mapPassing', () => {
  it('wraps transformed output in a passing RuleRunReturn', () => {
    const parser = mapPassing((value: string) => value.trim().toUpperCase());

    expect(parser('  vest  ')).toEqual({
      pass: true,
      type: 'VEST',
      message: undefined,
      path: undefined,
    });
  });
});
