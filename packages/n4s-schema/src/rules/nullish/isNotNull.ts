import { RuleInstance } from 'enforce';
import { isNotNull as isNotNullValue } from 'vest-utils';

// Type guard rule instance
export interface NotNullRuleInstance extends RuleInstance<any, [any]> {}

export function isNotNull(value: any): boolean {
  return isNotNullValue(value);
}
