import bindNot from 'bindNot';
import { isNumeric } from 'isNumeric';

export function isNegative(value: number | string): boolean {
  if (isNumeric(value)) {
    return Number(value) < 0;
  }
  return false;
}

export const isPositive = bindNot(isNegative);
