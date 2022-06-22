import { greaterThan } from 'greaterThan';

export function longerThan(
  value: string | unknown[],
  arg1: string | number
): boolean {
  return greaterThan(value.length, arg1);
}
