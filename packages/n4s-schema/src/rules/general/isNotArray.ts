import { RuleInstance } from '../../enforce';
import { genRuleChain } from '../genRuleChain';

export interface NotArrayRuleInstance extends RuleInstance<any, [any]> {}

const rules = {};

function notArrayPredicate(value: any): boolean {
  return !Array.isArray(value);
}

export function isNotArray(): NotArrayRuleInstance {
  const add = genRuleChain<NotArrayRuleInstance>(rules);
  return add(notArrayPredicate);
}
