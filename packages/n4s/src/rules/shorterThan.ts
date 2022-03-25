import { lessThan } from 'lessThan';

export function shorterThan(
  value: string | unknown[],
  arg1: string | number
): boolean {
  return lessThan(value.length, arg1);
}
