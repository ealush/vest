import { isNotNullish as isNotNullishValue } from 'vest-utils';

export function isNotNullish(value: any): boolean {
  return isNotNullishValue(value);
}
