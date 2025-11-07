import { isNullish as isNullishValue } from 'vest-utils';

export function isNullish(value: any): value is null | undefined {
  return isNullishValue(value);
}
