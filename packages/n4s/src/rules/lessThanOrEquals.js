import { isNumeric } from 'isNumeric';

export function lessThanOrEquals(value, arg1) {
  return isNumeric(value) && isNumeric(arg1) && Number(value) <= Number(arg1);
}
