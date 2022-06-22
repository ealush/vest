import { isStringValue, bindNot, isNullish } from 'vest-utils';

export function isBlank(value: unknown): boolean {
  return isNullish(value) || (isStringValue(value) && !value.trim());
}

export const isNotBlank = bindNot(isBlank);
