import { isNumeric } from 'isNumeric';

export function greaterThanOrEquals(
  value: string | number,
  gte: string | number
): boolean {
  return isNumeric(value) && isNumeric(gte) && Number(value) >= Number(gte);
}
