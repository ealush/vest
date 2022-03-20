import { lessThan } from 'lessThan';
import { numberEquals } from 'numberEquals';

export function lessThanOrEquals(
  value: string | number,
  lte: string | number
): boolean {
  return numberEquals(value, lte) || lessThan(value, lte);
}
