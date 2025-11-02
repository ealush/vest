import { isEmpty as isEmptyValue } from 'vest-utils';

export function isEmpty(value: any): boolean {
  return isEmptyValue(value);
}
