import { isNumeric } from 'isNumeric';

export function greaterThan(value: unknown, arg1: unknown): boolean {
  return isNumeric(value) && isNumeric(arg1) && Number(value) > Number(arg1);
}
