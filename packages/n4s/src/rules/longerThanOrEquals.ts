import { greaterThanOrEquals } from 'greaterThanOrEquals';

export function longerThanOrEquals(
  value: string | unknown[],
  arg1: string | number
): boolean {
  return greaterThanOrEquals(value.length, arg1);
}
