import { RuleInstance } from 'enforce';
import { isNull as isNullValue } from 'vest-utils';

// Type guard rule instance
export interface NullRuleInstance extends RuleInstance<null, [null]> {}

export function isNull(value: any): boolean {
  return isNullValue(value);
}
