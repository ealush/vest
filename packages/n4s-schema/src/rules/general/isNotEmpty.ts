import { isNotEmpty as isNotEmptyValue } from 'vest-utils';

import { RuleInstance } from '../../enforce';
import { genRuleChain } from '../genRuleChain';

export interface NotEmptyRuleInstance extends RuleInstance<any, [any]> {}

const rules = {};

function notEmptyPredicate(value: any): boolean {
  return isNotEmptyValue(value);
}

export function isNotEmpty(): NotEmptyRuleInstance {
  const add = genRuleChain<NotEmptyRuleInstance>(rules);
  return add(notEmptyPredicate);
}
