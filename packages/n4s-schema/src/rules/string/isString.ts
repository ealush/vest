import { isStringValue } from 'vest-utils';

export function isString(value: any): value is string {
  return isStringValue(value);
}
