import { isStringValue, bindNot, isNullish, BlankValue } from 'vest-utils';

export function isBlank(value: unknown): value is BlankValue {
  return isNullish(value) || (isStringValue(value) && !value.trim());
}

export const isNotBlank = bindNot(isBlank);
