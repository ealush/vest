import { mapPassing, registerParserRules } from './parserUtils';

export const join = (value: unknown[], separator = ',') =>
  mapPassing((current: unknown[]) => current.join(separator))(value);

export const uniq = (value: unknown[]) =>
  mapPassing((current: unknown[]) => [...new Set(current)])(value);

export const arrayParsers = {
  join,
  uniq,
} as const;

registerParserRules(arrayParsers);
