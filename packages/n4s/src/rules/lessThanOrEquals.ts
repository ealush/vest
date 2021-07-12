import { isNumeric } from 'isNumeric';

export function lessThanOrEquals(
  value: string | number,
  lte: string | number
): boolean {
  return isNumeric(value) && isNumeric(lte) && Number(value) <= Number(lte);
}
