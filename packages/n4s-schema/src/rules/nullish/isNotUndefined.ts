import { isNotUndefined as isNotUndefinedValue } from 'vest-utils';

import { RuleInstance } from '../../enforce';
import { genRuleChain } from '../genRuleChain';

// Type guard rule instance
export interface NotUndefinedRuleInstance extends RuleInstance<any, [any]> {}

const rules = {};

function isNotUndefinedPredicate(value: any): boolean {
  return isNotUndefinedValue(value);
}

export function isNotUndefined(): NotUndefinedRuleInstance {
  const add = genRuleChain<NotUndefinedRuleInstance>(rules);
  return add(isNotUndefinedPredicate);
}
