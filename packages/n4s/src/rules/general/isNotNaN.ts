import { toNumber } from 'vest-utils';

// Validates that a value is not NaN
export function isNotNaN(value: any): boolean {
  return !Number.isNaN(toNumber(value).unwrapOr(value));
}
