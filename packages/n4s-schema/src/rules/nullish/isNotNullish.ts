import { isNotNullish as isNotNullishValue } from 'vest-utils';

import { RuleInstance } from '../../enforce';
import { genRuleChain } from '../genRuleChain';

// Type guard rule instance
export interface NotNullishRuleInstance extends RuleInstance<any, [any]> {}

const rules = {};

function isNotNullishPredicate(value: any): boolean {
  return isNotNullishValue(value);
}

export function isNotNullish(): NotNullishRuleInstance {
  const add = genRuleChain<NotNullishRuleInstance>(rules);
  return add(isNotNullishPredicate);
}
