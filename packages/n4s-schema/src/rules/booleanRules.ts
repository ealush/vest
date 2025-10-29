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
  isFalsy: (value: boolean) => !value,
  isTrue,
  isTruthy: (value: boolean) => !!value,
};

export function isBoolean(): BooleanRuleInstance {
  const add = genRuleChain<BooleanRuleInstance>(rules);
  return add(value => typeof value === 'boolean');
}
