import { RuleInstance } from 'enforce';

import { toNumberStrict } from 'toNumber';

export interface NotNaNRuleInstance extends RuleInstance<any, [any]> {}

export function isNotNaN(value: any): boolean {
  return !Number.isNaN(toNumberStrict(value));
}
