import { isNumeric as isNumericValue } from 'vest-utils';

import { RuleInstance } from '../../enforce';
import { genRuleChain } from '../genRuleChain';

export interface NotNumericRuleInstance extends RuleInstance<any, [any]> {}

const rules = {};

function notNumericPredicate(value: any): boolean {
  return !isNumericValue(value);
}

export function isNotNumeric(): NotNumericRuleInstance {
  const add = genRuleChain<NotNumericRuleInstance>(rules);
  return add(notNumericPredicate);
}
