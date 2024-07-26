import { lessThan } from '@/rules/lessThan';

export function isNegative(value: number | string): boolean {
  return lessThan(value, 0);
}
