import { isNumeric } from 'isNumeric';

export function greaterThan(
  value: number | string,
  gt: number | string
): boolean {
  return isNumeric(value) && isNumeric(gt) && Number(value) > Number(gt);
}
