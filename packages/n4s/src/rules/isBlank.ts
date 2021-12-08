import bindNot from 'bindNot';
import { isNullish } from 'isNullish';
import { isStringValue } from 'isStringValue';

export function isBlank(value: unknown): boolean {
  return isNullish(value) || (isStringValue(value) && !value.trim());
}

export const isNotBlank = bindNot(isBlank);
