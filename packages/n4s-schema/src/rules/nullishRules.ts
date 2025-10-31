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
export interface NullRuleInstance extends RuleInstance<null, [null]> {}
export interface NotNullRuleInstance extends RuleInstance<any, [any]> {}
export interface UndefinedRuleInstance
  extends RuleInstance<undefined, [undefined]> {}
export interface NotUndefinedRuleInstance extends RuleInstance<any, [any]> {}
export interface NullishRuleInstance
  extends RuleInstance<null | undefined, [null | undefined]> {}
export interface NotNullishRuleInstance extends RuleInstance<any, [any]> {}

const nullRules = {};
const notNullRules = {};
const undefinedRules = {};
const notUndefinedRules = {};
const nullishRules = {};
const notNullishRules = {};

export function isNull(): NullRuleInstance {
  const add = genRuleChain<NullRuleInstance>(nullRules);
  function isNullPredicate(value: any): boolean {
    return isNullValue(value);
  }
  return add(isNullPredicate);
}

export function isNotNull(): NotNullRuleInstance {
  const add = genRuleChain<NotNullRuleInstance>(notNullRules);
  function isNotNullPredicate(value: any): boolean {
    return isNotNullValue(value);
  }
  return add(isNotNullPredicate);
}

export function isUndefined(): UndefinedRuleInstance {
  const add = genRuleChain<UndefinedRuleInstance>(undefinedRules);
  function isUndefinedPredicate(value: any): boolean {
    return isUndefinedValue(value);
  }
  return add(isUndefinedPredicate);
}

export function isNotUndefined(): NotUndefinedRuleInstance {
  const add = genRuleChain<NotUndefinedRuleInstance>(notUndefinedRules);
  function isNotUndefinedPredicate(value: any): boolean {
    return isNotUndefinedValue(value);
  }
  return add(isNotUndefinedPredicate);
}

export function isNullish(): NullishRuleInstance {
  const add = genRuleChain<NullishRuleInstance>(nullishRules);
  function isNullishPredicate(value: any): boolean {
    return isNullishValue(value);
  }
  return add(isNullishPredicate);
}

export function isNotNullish(): NotNullishRuleInstance {
  const add = genRuleChain<NotNullishRuleInstance>(notNullishRules);
  function isNotNullishPredicate(value: any): boolean {
    return isNotNullishValue(value);
  }
  return add(isNotNullishPredicate);
}
