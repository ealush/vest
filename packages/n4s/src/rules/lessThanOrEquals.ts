import { numberEquals } from 'vest-utils';

import { lessThan } from 'lessThan';

export function lessThanOrEquals(
  value: string | number,
  lte: string | number
): boolean {
  return numberEquals(value, lte) || lessThan(value, lte);
}
