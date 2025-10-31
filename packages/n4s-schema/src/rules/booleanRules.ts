import { RuleInstance } from '../enforce';

import { genRuleChain } from './genRuleChain';

export interface BooleanRuleInstance extends RuleInstance<boolean, [any]> {
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

const rules = {
  equals,
  isFalse,
  isFalsy: isFalsyRule,
  isTrue,
  isTruthy: isTruthyRule,
};

export function isBoolean(): BooleanRuleInstance {
  const add = genRuleChain<BooleanRuleInstance>(rules);
  function isBooleanPredicate(value: any): boolean {
    return typeof value === 'boolean';
  }
  return add(isBooleanPredicate);
}

function isFalsyRule(value: boolean): boolean {
  return !value;
}

function isTruthyRule(value: boolean): boolean {
  return !!value;
}
