import { isNotEmpty as isNotEmptyValue } from 'vest-utils';

export function notEmpty(arr: any[]): boolean {
  return Array.isArray(arr) && isNotEmptyValue(arr);
}
