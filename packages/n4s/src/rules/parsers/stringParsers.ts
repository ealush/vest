import { mapPassing, registerParserRules } from './parserUtils';

function toCamelCase(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+(.)?/g, (_match, chr: string | undefined) =>
      chr ? chr.toUpperCase() : '',
    );
}

function toPascalCase(value: string): string {
  const camel = toCamelCase(value);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

function toSnakeCase(value: string): string {
  return value
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

function toKebabCase(value: string): string {
  return value
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

export const append = (value: string, suffix: string) =>
  mapPassing((current: string) => `${current}${suffix}`)(value);

export const normalizeWhitespace = (value: string) =>
  mapPassing((current: string) => current.replace(/\s+/g, ' ').trim())(value);

export const prepend = (value: string, prefix: string) =>
  mapPassing((current: string) => `${prefix}${current}`)(value);

export const removeNonAlphanumeric = (value: string) =>
  mapPassing((current: string) => current.replace(/[^a-zA-Z0-9]/g, ''))(value);

export const removeNonDigits = (value: string) =>
  mapPassing((current: string) => current.replace(/\D+/g, ''))(value);

export const removeNonLetters = (value: string) =>
  mapPassing((current: string) => current.replace(/[^a-zA-Z]/g, ''))(value);

export const replace = (
  value: string,
  searchValue: string | RegExp,
  replaceValue: string,
) =>
  mapPassing((current: string) => current.replace(searchValue, replaceValue))(
    value,
  );

export const replaceAll = (
  value: string,
  searchValue: string | RegExp,
  replaceValue: string,
) =>
  mapPassing((current: string) =>
    typeof searchValue === 'string'
      ? searchValue === ''
        ? current
        : current.split(searchValue).join(replaceValue)
      : current.replace(
          new RegExp(
            searchValue.source,
            [...new Set(searchValue.flags + 'g')].join(''),
          ),
          replaceValue,
        ),
  )(value);

export const split = (
  value: string,
  separator: string | RegExp,
  limit?: number,
) => mapPassing((current: string) => current.split(separator, limit))(value);

export const stripWhitespace = (value: string) =>
  mapPassing((current: string) => current.replace(/\s+/g, ''))(value);

export const toCamel = (value: string) =>
  mapPassing((current: string) => toCamelCase(current))(value);

export const toCapitalized = (value: string) =>
  mapPassing(
    (current: string) =>
      current.charAt(0).toUpperCase() + current.slice(1).toLowerCase(),
  )(value);

export const toKebab = (value: string) =>
  mapPassing((current: string) => toKebabCase(current))(value);

export const toLower = (value: string) =>
  mapPassing((current: string) => current.toLowerCase())(value);

export const toPascal = (value: string) =>
  mapPassing((current: string) => toPascalCase(current))(value);

export const toSnake = (value: string) =>
  mapPassing((current: string) => toSnakeCase(current))(value);

export const toTitle = (value: string) =>
  mapPassing((current: string) =>
    current.toLowerCase().replace(/\b\w/g, char => char.toUpperCase()),
  )(value);

export const toUpper = (value: string) =>
  mapPassing((current: string) => current.toUpperCase())(value);

export const trim = (value: string) =>
  mapPassing((current: string) => current.trim())(value);

export const trimEnd = (value: string) =>
  mapPassing((current: string) => current.trimEnd())(value);

export const trimStart = (value: string) =>
  mapPassing((current: string) => current.trimStart())(value);

export const stringParsers = {
  append,
  normalizeWhitespace,
  prepend,
  removeNonAlphanumeric,
  removeNonDigits,
  removeNonLetters,
  replace,
  replaceAll,
  split,
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
} as const;

registerParserRules(stringParsers);
