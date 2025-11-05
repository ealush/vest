import { RuleInstance } from 'enforceUtil';
import { toNumber } from 'toNumber';

export interface NaNRuleInstance extends RuleInstance<number | string, [any]> {}

export function isNaN(value: number | string): boolean {
  return Number.isNaN(toNumber(value));
}
