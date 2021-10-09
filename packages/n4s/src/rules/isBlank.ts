import bindNot from 'bindNot';
import { isStringValue } from 'isStringValue';

export function isBlank(value: unknown): boolean {
  return isStringValue(value) && !value.trim();
}

export const isNotBlank = bindNot(isBlank);
