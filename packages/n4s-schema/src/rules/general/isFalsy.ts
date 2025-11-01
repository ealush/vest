import { RuleInstance } from '../../enforce';
import { genRuleChain } from '../genRuleChain';

export interface FalsyRuleInstance extends RuleInstance<any, [any]> {}

const rules = {};

function falsyPredicate(value: any): boolean {
  return !value;
}

export function isFalsy(): FalsyRuleInstance {
  const add = genRuleChain<FalsyRuleInstance>(rules);
  return add(falsyPredicate);
}
