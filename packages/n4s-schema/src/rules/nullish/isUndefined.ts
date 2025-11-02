import { RuleInstance } from 'enforceUtil';
import { isUndefined as isUndefinedValue } from 'vest-utils';

// Type guard rule instance
export interface UndefinedRuleInstance
  extends RuleInstance<undefined, [undefined]> {}

export function isUndefined(value: any): boolean {
  return isUndefinedValue(value);
}
