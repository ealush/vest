import bindNot from 'bindNot';
import { isNumeric } from 'isNumeric';

export function numberEquals(value: unknown, arg1: unknown): boolean {
  return isNumeric(value) && isNumeric(arg1) && Number(value) === Number(arg1);
}

export const numberNotEquals = bindNot(numberEquals);
