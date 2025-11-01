import { RuleInstance } from '../../enforce';
import { genRuleChain } from '../genRuleChain';

export interface NaNRuleInstance extends RuleInstance<any, [any]> {}

const rules = {};

function isNaNPredicate(value: any): boolean {
  return Number.isNaN(value);
}

export function isNaN(): NaNRuleInstance {
  const add = genRuleChain<NaNRuleInstance>(rules);
  return add(isNaNPredicate);
}
