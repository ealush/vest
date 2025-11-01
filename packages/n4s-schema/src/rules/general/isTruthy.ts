import { RuleInstance } from '../../enforce';
import { genRuleChain } from '../genRuleChain';

export interface TruthyRuleInstance extends RuleInstance<any, [any]> {}

const rules = {};

function truthyPredicate(value: any): boolean {
  return !!value;
}

export function isTruthy(): TruthyRuleInstance {
  const add = genRuleChain<TruthyRuleInstance>(rules);
  return add(truthyPredicate);
}
