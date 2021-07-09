import bindNot from 'bindNot';
import { isNumeric } from 'isNumeric';

export function numberEquals(
  value: string | number,
  eq: string | number
): boolean {
  return isNumeric(value) && isNumeric(eq) && Number(value) === Number(eq);
}

export const numberNotEquals = bindNot(numberEquals);
