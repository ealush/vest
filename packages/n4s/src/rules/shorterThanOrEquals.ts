import { lessThanOrEquals } from 'lessThanOrEquals';

export function shorterThanOrEquals(
  value: string | unknown[],
  arg1: string | number
): boolean {
  return lessThanOrEquals(value.length, arg1);
}
