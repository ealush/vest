/**
 * Module: `src/rules/number/lessThanOrEquals.ts`.
 *
 * Provides `lessThanOrEquals`-related runtime and type utilities used by `n4s`.
 */
import { numberEquals } from 'vest-utils';

import { lessThan } from './lessThan';

// Checks if numeric value is less than or equal to the given threshold
export function lessThanOrEquals(
  value: string | number,
  lte: string | number,
): boolean {
  return numberEquals(value, lte) || lessThan(value, lte);
}
