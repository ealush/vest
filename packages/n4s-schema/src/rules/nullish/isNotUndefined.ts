import { RuleInstance } from 'enforce';
import { isNotUndefined as isNotUndefinedValue } from 'vest-utils';

// Type guard rule instance
export interface NotUndefinedRuleInstance extends RuleInstance<any, [any]> {}

export function isNotUndefined(value: any): boolean {
  return isNotUndefinedValue(value);
}
