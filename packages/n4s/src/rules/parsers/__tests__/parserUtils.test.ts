import { describe, expect, it } from 'vitest';

import { mapPassing } from '../parserUtils';
import { toLower, trim } from '../stringParsers';

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

describe('string parsers on non-string input', () => {
  // Mapping never short-circuits on verdicts, so a parser step observes
  // values its chain validators already rejected. Non-string input is a
  // validation matter: parsers fail closed with the untouched value
  // instead of throwing a TypeError.
  it.each([
    ['trim', trim],
    ['toLower', toLower],
  ])('%s fails closed without throwing', (_name, parser) => {
    let result: unknown;
    expect(() => {
      result = (parser as (value: unknown) => unknown)(123);
    }).not.toThrow();
    expect(result).toMatchObject({ pass: false, type: 123 });
  });

  it('still transforms string input', () => {
    expect(trim('  vest  ')).toMatchObject({ pass: true, type: 'vest' });
    expect(toLower('VeSt')).toMatchObject({ pass: true, type: 'vest' });
  });
});
