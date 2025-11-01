import { isNotNull as isNotNullValue } from 'vest-utils';

import { RuleInstance } from '../../enforce';
import { genRuleChain } from '../genRuleChain';

// Type guard rule instance
export interface NotNullRuleInstance extends RuleInstance<any, [any]> {}

const rules = {};

function isNotNullPredicate(value: any): boolean {
  return isNotNullValue(value);
}

export function isNotNull(): NotNullRuleInstance {
  const add = genRuleChain<NotNullRuleInstance>(rules);
  return add(isNotNullPredicate);
}
