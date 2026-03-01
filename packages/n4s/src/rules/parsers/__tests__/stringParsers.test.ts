import { describe, expect, it } from 'vitest';

import {
  append,
  normalizeWhitespace,
  prepend,
  removeNonAlphanumeric,
  removeNonDigits,
  removeNonLetters,
  replace,
  split,
  stringParsers,
  stripWhitespace,
  toCamel,
  toCapitalized,
  toKebab,
  toLower,
  toPascal,
  toSnake,
  toTitle,
  toUpper,
  trim,
  trimEnd,
  trimStart,
} from '../stringParsers';

describe('string parsers', () => {
  it('exports all string parser functions', () => {
    expect(Object.keys(stringParsers).sort()).toEqual([
      'append',
      'normalizeWhitespace',
      'prepend',
      'removeNonAlphanumeric',
      'removeNonDigits',
      'removeNonLetters',
      'replace',
      'split',
      'stripWhitespace',
      'toCamel',
      'toCapitalized',
      'toKebab',
      'toLower',
      'toPascal',
      'toSnake',
      'toTitle',
      'toUpper',
      'trim',
      'trimEnd',
      'trimStart',
    ]);
  });

  it('append', () => {
    expect(append('vest', '-js').type).toBe('vest-js');
  });

  it('normalizeWhitespace', () => {
    expect(normalizeWhitespace('  v   e   s t  ').type).toBe('v e s t');
  });

  it('prepend', () => {
    expect(prepend('vest', 'hello-').type).toBe('hello-vest');
  });

  it('removeNonAlphanumeric', () => {
    expect(removeNonAlphanumeric('v-e_s t!42').type).toBe('vest42');
  });

  it('removeNonDigits', () => {
    expect(removeNonDigits('v1e2s3t').type).toBe('123');
  });

  it('removeNonLetters', () => {
    expect(removeNonLetters('v1e_2s-3t!').type).toBe('vest');
  });

  it('replace', () => {
    expect(replace('vest rocks', 'rocks', 'rules').type).toBe('vest rules');
  });

  it('split', () => {
    expect(split('a,b,c', ',', 2).type).toEqual(['a', 'b']);
  });

  it('stripWhitespace', () => {
    expect(stripWhitespace(' v e s t ').type).toBe('vest');
  });

  it('toCamel', () => {
    expect(toCamel('hello_world-test').type).toBe('helloWorldTest');
  });

  it('toCapitalized', () => {
    expect(toCapitalized('vEST').type).toBe('Vest');
  });

  it('toKebab', () => {
    expect(toKebab('helloWorld Test').type).toBe('hello-world-test');
  });

  it('toLower', () => {
    expect(toLower('VeSt').type).toBe('vest');
  });

  it('toPascal', () => {
    expect(toPascal('hello_world-test').type).toBe('HelloWorldTest');
  });

  it('toSnake', () => {
    expect(toSnake('helloWorld Test').type).toBe('hello_world_test');
  });

  it('toTitle', () => {
    expect(toTitle('hELLO woRLD').type).toBe('Hello World');
  });

  it('toUpper', () => {
    expect(toUpper('VeSt').type).toBe('VEST');
  });

  it('trim', () => {
    expect(trim('  vest  ').type).toBe('vest');
  });

  it('trimEnd', () => {
    expect(trimEnd('vest  ').type).toBe('vest');
  });

  it('trimStart', () => {
    expect(trimStart('  vest').type).toBe('vest');
  });
});
