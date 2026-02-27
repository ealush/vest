/**
 * Module: `src/rules/number/greaterThanOrEquals.ts`.
 *
 * Provides `greaterThanOrEquals`-related runtime and type utilities used by `n4s`.
 */
import { greaterThan, numberEquals } from 'vest-utils';

// Checks if numeric value is greater than or equal to the given threshold
export function greaterThanOrEquals(
  value: string | number,
  gte: string | number,
): boolean {
  return numberEquals(value, gte) || greaterThan(value, gte);
}
