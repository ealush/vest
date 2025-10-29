import {
  isNull as isNullValue,
  isNotNull as isNotNullValue,
  isNullish as isNullishValue,
  isNotNullish as isNotNullishValue,
  isUndefined as isUndefinedValue,
  isNotUndefined as isNotUndefinedValue,
} from 'vest-utils';

import { RuleInstance } from '../enforce';

import { genRuleChain } from './genRuleChain';

// Type guard rule instances
export interface NullRuleInstance extends RuleInstance<null, [any]> {}
export interface NotNullRuleInstance extends RuleInstance<any, [any]> {}
export interface UndefinedRuleInstance extends RuleInstance<undefined, [any]> {}
export interface NotUndefinedRuleInstance extends RuleInstance<any, [any]> {}
export interface NullishRuleInstance
  extends RuleInstance<null | undefined, [any]> {}
export interface NotNullishRuleInstance extends RuleInstance<any, [any]> {}

const nullRules = {};
const notNullRules = {};
const undefinedRules = {};
const notUndefinedRules = {};
const nullishRules = {};
const notNullishRules = {};

export function isNull(): NullRuleInstance {
  const add = genRuleChain<NullRuleInstance>(nullRules);
  return add(value => isNullValue(value));
}

export function isNotNull(): NotNullRuleInstance {
  const add = genRuleChain<NotNullRuleInstance>(notNullRules);
  return add(value => isNotNullValue(value));
}

export function isUndefined(): UndefinedRuleInstance {
  const add = genRuleChain<UndefinedRuleInstance>(undefinedRules);
  return add(value => isUndefinedValue(value));
}

export function isNotUndefined(): NotUndefinedRuleInstance {
  const add = genRuleChain<NotUndefinedRuleInstance>(notUndefinedRules);
  return add(value => isNotUndefinedValue(value));
}

export function isNullish(): NullishRuleInstance {
  const add = genRuleChain<NullishRuleInstance>(nullishRules);
  return add(value => isNullishValue(value));
}

export function isNotNullish(): NotNullishRuleInstance {
  const add = genRuleChain<NotNullishRuleInstance>(notNullishRules);
  return add(value => isNotNullishValue(value));
}
