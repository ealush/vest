import { isNumeric } from 'vest-utils';

export function lessThan(value: string | number, lt: string | number): boolean {
  return isNumeric(value) && isNumeric(lt) && Number(value) < Number(lt);
}
