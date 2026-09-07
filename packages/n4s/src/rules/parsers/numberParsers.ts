import { RuleRunReturn } from '../../utils/RuleRunReturn';

import { mapPassing, registerParserRules } from './parserUtils';

export const ceil = (value: number) =>
  mapPassing((current: number) => Math.ceil(current))(value);

export const clamp = (value: number, min: number, max: number) =>
  mapPassing((current: number) => Math.min(max, Math.max(min, current)))(value);

export const floor = (value: number) =>
  mapPassing((current: number) => Math.floor(current))(value);

export const round = (value: number) =>
  mapPassing((current: number) => Math.round(current))(value);

export const toAbsolute = (value: number) =>
  mapPassing((current: number) => Math.abs(current))(value);

export const toDate = (value: unknown): RuleRunReturn<Date> => {
  if (
    typeof value !== 'string' &&
    typeof value !== 'number' &&
    !(value instanceof Date)
  ) {
    return RuleRunReturn.Failing(
      new Date(NaN),
      'Could not parse to Date: expected string, number, or Date',
    );
  }

  const parsed = new Date(value as string | number | Date);
  if (Number.isNaN(parsed.getTime())) {
    return RuleRunReturn.Failing(parsed, 'Could not parse to Date');
  }

  return RuleRunReturn.Passing(parsed);
};

export const toFloat = (value: unknown): RuleRunReturn<number> => {
  const parsed = typeof value === 'number' ? value : parseFloat(String(value));
  if (Number.isNaN(parsed)) {
    return RuleRunReturn.Failing(NaN, 'Could not parse to float');
  }

  return RuleRunReturn.Passing(parsed);
};

function isValidRadix(radix: number): boolean {
  return Number.isInteger(radix) && radix >= 2 && radix <= 36;
}

export const toInteger = (
  value: unknown,
  radix = 10,
): RuleRunReturn<number> => {
  if (!isValidRadix(radix)) {
    return RuleRunReturn.Failing(
      NaN,
      'Invalid radix: must be an integer between 2 and 36',
    );
  }

  const parsed =
    typeof value === 'number'
      ? Math.trunc(value)
      : parseInt(String(value), radix);

  if (Number.isNaN(parsed)) {
    return RuleRunReturn.Failing(NaN, 'Could not parse to integer');
  }

  return RuleRunReturn.Passing(parsed);
};

export const numberParsers = {
  ceil,
  clamp,
  floor,
  round,
  toAbsolute,
  toDate,
  toFloat,
  toInteger,
} as const;

registerParserRules(numberParsers);
