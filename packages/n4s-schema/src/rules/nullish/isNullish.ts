import { isNullish as isNullishValue } from 'vest-utils';

import { RuleInstance } from '../../enforce';

// Type guard rule instance
export interface NullishRuleInstance
  extends RuleInstance<null | undefined, [null | undefined]> {}

export function isNullish(value: any): boolean {
  return isNullishValue(value);
}
