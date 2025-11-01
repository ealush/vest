import { isNotNullish as isNotNullishValue } from 'vest-utils';

import { RuleInstance } from '../../enforce';

// Type guard rule instance
export interface NotNullishRuleInstance extends RuleInstance<any, [any]> {}

export function isNotNullish(value: any): boolean {
  return isNotNullishValue(value);
}
