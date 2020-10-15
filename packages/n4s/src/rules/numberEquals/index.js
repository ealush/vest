import { bindNot } from '../../lib';
import { isNumeric } from '../isNumeric';

export function numberEquals(value, arg1) {
  return isNumeric(value) && isNumeric(arg1) && Number(value) === Number(arg1);
}

export const numberNotEquals = bindNot(numberEquals);
