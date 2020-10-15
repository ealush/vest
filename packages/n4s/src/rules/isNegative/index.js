import { bindNot } from '../../lib';
import { isNumeric } from '../isNumeric';

export function isNegative(value) {
  if (isNumeric(value)) {
    return Number(value) < 0;
  }
  return false;
}

export const isPositive = bindNot(isNegative);
