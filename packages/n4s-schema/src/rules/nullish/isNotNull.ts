import { isNotNull as isNotNullValue } from 'vest-utils';

import { RuleInstance } from '../../enforce';

// Type guard rule instance
export interface NotNullRuleInstance extends RuleInstance<any, [any]> {}

export function isNotNull(value: any): boolean {
  return isNotNullValue(value);
}
