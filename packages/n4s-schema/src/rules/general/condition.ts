import { RuleInstance } from '../../enforce';
import { genRuleChain } from '../genRuleChain';

export interface ConditionRuleInstance extends RuleInstance<boolean, [any]> {}

const rules = {};

function conditionPredicateFactory(cond: boolean) {
  return function conditionPredicate(): boolean {
    return cond;
  };
}

export function condition(cond: boolean): ConditionRuleInstance {
  const add = genRuleChain<ConditionRuleInstance>(rules);
  return add(conditionPredicateFactory(cond));
}
