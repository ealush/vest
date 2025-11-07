import { isNullish as isNullishValue } from 'vest-utils';

export function isNullish(value: any): boolean {
  return isNullishValue(value);
}
