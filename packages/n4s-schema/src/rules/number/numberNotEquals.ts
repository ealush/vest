import { numberNotEquals as numberNotEqualsValue } from 'vest-utils';

// Checks if numeric value is not equal to the given number (with tolerance for floating-point)
export function numberNotEquals(value: number, n: number | string): boolean {
  return numberNotEqualsValue(value, n as any);
}
