import { isBoolean as isBooleanValue } from 'vest-utils';

export function isBoolean(value: any): value is boolean {
  return isBooleanValue(value);
}
