import { RuleInstance } from 'enforce';
import { isNullish as isNullishValue } from 'vest-utils';

// Type guard rule instance
export interface NullishRuleInstance
  extends RuleInstance<null | undefined, [null | undefined]> {}

export function isNullish(value: any): boolean {
  return isNullishValue(value);
}
