import { RuleInstance } from 'enforce';

import { toNumber } from 'toNumber';

export interface NotNaNRuleInstance extends RuleInstance<any, [any]> {}

export function isNotNaN(value: any): boolean {
  return !Number.isNaN(toNumber(value));
}
