import { RuleInstance } from '../../enforce';
import { genRuleChain } from '../genRuleChain';

export interface NotBooleanRuleInstance extends RuleInstance<any, [any]> {}

const rules = {};

function notBooleanPredicate(value: any): boolean {
  return typeof value !== 'boolean';
}

export function isNotBoolean(): NotBooleanRuleInstance {
  const add = genRuleChain<NotBooleanRuleInstance>(rules);
  return add(notBooleanPredicate);
}
