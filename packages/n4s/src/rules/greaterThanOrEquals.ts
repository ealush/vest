import { isNumeric } from 'isNumeric';

export function greaterThanOrEquals(value: unknown, arg1: unknown): boolean {
  return isNumeric(value) && isNumeric(arg1) && Number(value) >= Number(arg1);
}
