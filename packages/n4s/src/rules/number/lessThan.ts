/**
 * Module: `src/rules/number/lessThan.ts`.
 *
 * Provides `lessThan`-related runtime and type utilities used by `n4s`.
 */
import { isNumeric } from 'vest-utils';

// Checks if numeric value is less than the given threshold
export function lessThan(value: string | number, lt: string | number): boolean {
  return isNumeric(value) && isNumeric(lt) && Number(value) < Number(lt);
}
