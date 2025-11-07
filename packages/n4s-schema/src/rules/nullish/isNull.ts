import { isNull as isNullValue } from 'vest-utils';

export function isNull(value: any): boolean {
  return isNullValue(value);
}
