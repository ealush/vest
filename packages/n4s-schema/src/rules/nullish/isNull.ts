import { isNull as isNullValue } from 'vest-utils';

import { RuleInstance } from '../../enforce';
import { genRuleChain } from '../genRuleChain';

// Type guard rule instance
export interface NullRuleInstance extends RuleInstance<null, [null]> {}

const rules = {};

function isNullPredicate(value: any): boolean {
  return isNullValue(value);
}

export function isNull(): NullRuleInstance {
  const add = genRuleChain<NullRuleInstance>(rules);
  return add(isNullPredicate);
}
