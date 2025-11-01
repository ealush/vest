import { RuleInstance } from '../../enforce';
import { genRuleChain } from '../genRuleChain';

export interface NotStringRuleInstance extends RuleInstance<any, [any]> {}

const rules = {};

function notStringPredicate(value: any): boolean {
  return typeof value !== 'string';
}

export function isNotString(): NotStringRuleInstance {
  const add = genRuleChain<NotStringRuleInstance>(rules);
  return add(notStringPredicate);
}
