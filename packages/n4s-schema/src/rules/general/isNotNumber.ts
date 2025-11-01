import { RuleInstance } from '../../enforce';
import { genRuleChain } from '../genRuleChain';

export interface NotNumberRuleInstance extends RuleInstance<any, [any]> {}

const rules = {};

function notNumberPredicate(value: any): boolean {
  return typeof value !== 'number' || Number.isNaN(value);
}

export function isNotNumber(): NotNumberRuleInstance {
  const add = genRuleChain<NotNumberRuleInstance>(rules);
  return add(notNumberPredicate);
}
