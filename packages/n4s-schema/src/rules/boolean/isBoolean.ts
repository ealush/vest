import { RuleInstance } from '../../enforce';
import { genRuleChain } from '../genRuleChain';

export interface BooleanRuleInstance extends RuleInstance<boolean, [boolean]> {
  isTrue(): BooleanRuleInstance;
  isFalse(): BooleanRuleInstance;
  isTruthy(): BooleanRuleInstance;
  isFalsy(): BooleanRuleInstance;
  equals(v: boolean): BooleanRuleInstance;
}

function isTrue(value: boolean): boolean {
  return value === true;
}

function isFalse(value: boolean): boolean {
  return value === false;
}

function equals(value: boolean, v: boolean): boolean {
  return value === v;
}

function isFalsyRule(value: boolean): boolean {
  return !value;
}

function isTruthyRule(value: boolean): boolean {
  return !!value;
}

const rules = {
  equals,
  isFalse,
  isFalsy: isFalsyRule,
  isTrue,
  isTruthy: isTruthyRule,
};

function isBooleanPredicate(value: any): boolean {
  return typeof value === 'boolean';
}

export function isBoolean(): BooleanRuleInstance {
  const add = genRuleChain<BooleanRuleInstance>(rules);
  return add(isBooleanPredicate);
}
