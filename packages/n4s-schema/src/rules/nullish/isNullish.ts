import { isNullish as isNullishValue } from 'vest-utils';

import { RuleInstance } from '../../enforce';
import { genRuleChain } from '../genRuleChain';

// Type guard rule instance
export interface NullishRuleInstance
  extends RuleInstance<null | undefined, [null | undefined]> {}

const rules = {};

function isNullishPredicate(value: any): boolean {
  return isNullishValue(value);
}

export function isNullish(): NullishRuleInstance {
  const add = genRuleChain<NullishRuleInstance>(rules);
  return add(isNullishPredicate);
}
