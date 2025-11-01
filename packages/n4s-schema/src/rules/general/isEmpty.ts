import { isEmpty as isEmptyValue } from 'vest-utils';

import { RuleInstance } from '../../enforce';
import { genRuleChain } from '../genRuleChain';

export interface EmptyRuleInstance extends RuleInstance<any, [any]> {}

const rules = {};

function emptyPredicate(value: any): boolean {
  return isEmptyValue(value);
}

export function isEmpty(): EmptyRuleInstance {
  const add = genRuleChain<EmptyRuleInstance>(rules);
  return add(emptyPredicate);
}
