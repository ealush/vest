import { RuleInstance } from '../../enforce';
import { genRuleChain } from '../genRuleChain';

export interface NotNaNRuleInstance extends RuleInstance<any, [any]> {}

const rules = {};

function isNotNaNPredicate(value: any): boolean {
  return !Number.isNaN(value);
}

export function isNotNaN(): NotNaNRuleInstance {
  const add = genRuleChain<NotNaNRuleInstance>(rules);
  return add(isNotNaNPredicate);
}
