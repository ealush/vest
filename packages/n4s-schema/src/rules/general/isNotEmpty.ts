import { isNotEmpty as isNotEmptyValue } from 'vest-utils';

// Checks if value is not empty (not null, undefined, empty string, empty array, or empty object)
export function isNotEmpty(value: any): boolean {
  return isNotEmptyValue(value);
}
