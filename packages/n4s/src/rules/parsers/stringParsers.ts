import { RuleRunReturn } from '../../utils/RuleRunReturn';
import { mapPassing, registerParserRules } from './parserUtils';

/**
 * Total string-transform application: string parsers declare a
 * string-to-string transform, so non-string input is a validation matter,
 * not a crash. Mapping (`executeMappingChain`) never short-circuits on
 * verdicts, which lets a parser step observe values its chain validators
 * already rejected (e.g. a numeric email reaching `trim()` during
 * failure mapping). Failing closed with the untouched value keeps the run
 * a validation failure instead of an unexpected TypeError, and the
 * validators still report the mismatch. Direct `enforce(x).trim()` use on
 * non-strings now fails validation rather than throwing.
 */
function mapString<TOutput>(transform: (value: string) => TOutput) {
  // The (value: string) signature preserves each factory's declared chain
  // contract exactly; the runtime guard only defends the untyped mapping
  // path (which observes values validators already rejected). The else
  // branch is unreachable per the types, so it collapses to never and
  // needs no cast.
  return (value: string): RuleRunReturn<TOutput> => {
    if (typeof value !== 'string') return RuleRunReturn.Failing(value);
    return mapPassing(transform)(value);
  };
}

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
  mapString((current: string) => `${current}${suffix}`)(value);

export const normalizeWhitespace = (value: string) =>
  mapString((current: string) => current.replace(/\s+/g, ' ').trim())(value);

export const prepend = (value: string, prefix: string) =>
  mapString((current: string) => `${prefix}${current}`)(value);

export const removeNonAlphanumeric = (value: string) =>
  mapString((current: string) => current.replace(/[^a-zA-Z0-9]/g, ''))(value);

export const removeNonDigits = (value: string) =>
  mapString((current: string) => current.replace(/\D+/g, ''))(value);

export const removeNonLetters = (value: string) =>
  mapString((current: string) => current.replace(/[^a-zA-Z]/g, ''))(value);

export const replace = (
  value: string,
  searchValue: string | RegExp,
  replaceValue: string,
) =>
  mapString((current: string) => current.replace(searchValue, replaceValue))(
    value,
  );

export const replaceAll = (
  value: string,
  searchValue: string | RegExp,
  replaceValue: string,
) =>
  mapString((current: string) =>
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
) => mapString((current: string) => current.split(separator, limit))(value);

export const stripWhitespace = (value: string) =>
  mapString((current: string) => current.replace(/\s+/g, ''))(value);

export const toCamel = (value: string) =>
  mapString((current: string) => toCamelCase(current))(value);

export const toCapitalized = (value: string) =>
  mapString(
    (current: string) =>
      current.charAt(0).toUpperCase() + current.slice(1).toLowerCase(),
  )(value);

export const toKebab = (value: string) =>
  mapString((current: string) => toKebabCase(current))(value);

export const toLower = (value: string) =>
  mapString((current: string) => current.toLowerCase())(value);

export const toPascal = (value: string) =>
  mapString((current: string) => toPascalCase(current))(value);

export const toSnake = (value: string) =>
  mapString((current: string) => toSnakeCase(current))(value);

export const toTitle = (value: string) =>
  mapString((current: string) =>
    current.toLowerCase().replace(/\b\w/g, char => char.toUpperCase()),
  )(value);

export const toUpper = (value: string) =>
  mapString((current: string) => current.toUpperCase())(value);

export const trim = (value: string) =>
  mapString((current: string) => current.trim())(value);

export const trimEnd = (value: string) =>
  mapString((current: string) => current.trimEnd())(value);

export const trimStart = (value: string) =>
  mapString((current: string) => current.trimStart())(value);

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
