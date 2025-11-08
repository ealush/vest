import { greaterThan } from 'greaterThan';

export function isPositive(value: number | string): boolean {
  return greaterThan(value, 0);
}
