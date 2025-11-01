import { RuleInstance } from 'enforce';
import { isNotNullish as isNotNullishValue } from 'vest-utils';

// Type guard rule instance
export interface NotNullishRuleInstance extends RuleInstance<any, [any]> {}

export function isNotNullish(value: any): boolean {
  return isNotNullishValue(value);
}
