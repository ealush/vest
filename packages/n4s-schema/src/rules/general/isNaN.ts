import { RuleInstance } from 'enforce';

import { toNumberStrict } from 'toNumber';

export interface NaNRuleInstance extends RuleInstance<any, [any]> {}

export function isNaN(value: any): boolean {
  return Number.isNaN(toNumberStrict(value));
}
