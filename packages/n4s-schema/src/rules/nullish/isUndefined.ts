import { isUndefined as isUndefinedValue } from 'vest-utils';

import { RuleInstance } from '../../enforce';
import { genRuleChain } from '../genRuleChain';

// Type guard rule instance
export interface UndefinedRuleInstance
  extends RuleInstance<undefined, [undefined]> {}

const rules = {};

function isUndefinedPredicate(value: any): boolean {
  return isUndefinedValue(value);
}

export function isUndefined(): UndefinedRuleInstance {
  const add = genRuleChain<UndefinedRuleInstance>(rules);
  return add(isUndefinedPredicate);
}
