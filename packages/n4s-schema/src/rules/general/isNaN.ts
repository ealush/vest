import { RuleInstance } from 'RuleInstance';
import { toNumber } from 'toNumber';

export interface NaNRuleInstance extends RuleInstance<number | string, [any]> {}

// Validates that a value is NaN (Not a Number)
export function isNaN(value: number | string): boolean {
  return Number.isNaN(Number(value));
}
