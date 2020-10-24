import { isNumeric } from 'isNumeric';

export function greaterThanOrEquals(value, arg1) {
  return isNumeric(value) && isNumeric(arg1) && Number(value) >= Number(arg1);
}
