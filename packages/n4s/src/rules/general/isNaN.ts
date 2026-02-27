/**
 * Module: `src/rules/general/isNaN.ts`.
 *
 * Provides `isNaN`-related runtime and type utilities used by `n4s`.
 */
import { toNumber } from 'vest-utils';

import { RuleInstance } from '../../utils/RuleInstance';

export interface NaNRuleInstance extends RuleInstance<number | string, [any]> {}

// Validates that a value is NaN (Not a Number)
export function isNaN(value: number | string): boolean {
  return Number.isNaN(toNumber(value).unwrapOr(NaN));
}
