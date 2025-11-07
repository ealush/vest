import { isNull as isNullValue } from 'vest-utils';

export function isNull(value: any): value is null {
  return isNullValue(value);
}
