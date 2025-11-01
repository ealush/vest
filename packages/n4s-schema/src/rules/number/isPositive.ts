import { isPositive as isPositiveBase } from '../commonNumeric';

export function isPositive(value: number): boolean {
  return isPositiveBase(value);
}
