import { isEmpty as isEmptyValue } from 'vest-utils';

export function empty(arr: any[]): boolean {
  return Array.isArray(arr) && isEmptyValue(arr);
}
