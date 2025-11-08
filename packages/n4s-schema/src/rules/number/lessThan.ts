import { isNumeric } from 'vest-utils';

// Checks if numeric value is less than the given threshold
export function lessThan(value: string | number, lt: string | number): boolean {
  return isNumeric(value) && isNumeric(lt) && Number(value) < Number(lt);
}
