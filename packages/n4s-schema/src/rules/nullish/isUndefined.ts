import { isUndefined as isUndefinedValue } from 'vest-utils';

export function isUndefined(value: any): value is undefined {
  return isUndefinedValue(value);
}
