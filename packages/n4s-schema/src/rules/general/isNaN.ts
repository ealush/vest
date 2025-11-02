import { RuleInstance } from 'enforce';

import { toNumber } from 'toNumber';

export interface NaNRuleInstance extends RuleInstance<any, [any]> {}

export function isNaN(value: any): boolean {
  return Number.isNaN(toNumber(value));
}
