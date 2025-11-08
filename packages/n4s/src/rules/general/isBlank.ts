import { BlankValue, isNullish, isStringValue } from 'vest-utils';

export function isBlank(value: unknown): value is BlankValue {
  return isNullish(value) || (isStringValue(value) && !value.trim());
}

export function isNotBlank(value: unknown): boolean {
  return !isBlank(value);
}
