import { isNotUndefined as isNotUndefinedValue } from 'vest-utils';

import { RuleInstance } from '../../enforce';

// Type guard rule instance
export interface NotUndefinedRuleInstance extends RuleInstance<any, [any]> {}

export function isNotUndefined(value: any): boolean {
  return isNotUndefinedValue(value);
}
