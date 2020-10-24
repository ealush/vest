import { isNumeric } from 'isNumeric';

export function lessThan(value, arg1) {
  return isNumeric(value) && isNumeric(arg1) && Number(value) < Number(arg1);
}
