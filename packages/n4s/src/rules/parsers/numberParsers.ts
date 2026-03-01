import { RuleRunReturn } from '../../utils/RuleRunReturn';

import { mapPassing } from './parserUtils';

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

export const toInteger = (
  value: unknown,
  radix = 10,
): RuleRunReturn<number> => {
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
