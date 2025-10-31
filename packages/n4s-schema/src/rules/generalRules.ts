import {
  isEmpty as isEmptyValue,
  isNotEmpty as isNotEmptyValue,
  isNumeric as isNumericValue,
} from 'vest-utils';

import { RuleInstance } from '../enforce';

import { genRuleChain } from './genRuleChain';

export interface TruthyRuleInstance extends RuleInstance<any, [any]> {}
export interface FalsyRuleInstance extends RuleInstance<any, [any]> {}
export interface EmptyRuleInstance extends RuleInstance<any, [any]> {}
export interface NotEmptyRuleInstance extends RuleInstance<any, [any]> {}
export interface NaNRuleInstance extends RuleInstance<any, [any]> {}
export interface NotNaNRuleInstance extends RuleInstance<any, [any]> {}
export interface ConditionRuleInstance extends RuleInstance<boolean, [any]> {}
export interface NotArrayRuleInstance extends RuleInstance<any, [any]> {}
export interface NotBooleanRuleInstance extends RuleInstance<any, [any]> {}
export interface NotNumberRuleInstance extends RuleInstance<any, [any]> {}
export interface NotStringRuleInstance extends RuleInstance<any, [any]> {}
export interface NotNumericRuleInstance extends RuleInstance<any, [any]> {}

const truthyRules = {};
const falsyRules = {};
const emptyRules = {};
const notEmptyRules = {};
const nanRules = {};
const notNanRules = {};
const conditionRules = {};
const notArrayRules = {};
const notBooleanRules = {};
const notNumberRules = {};
const notStringRules = {};
const notNumericRules = {};

export function isTruthy(): TruthyRuleInstance {
  const add = genRuleChain<TruthyRuleInstance>(truthyRules);
  function truthyPredicate(value: any): boolean {
    return !!value;
  }
  return add(truthyPredicate);
}

export function isFalsy(): FalsyRuleInstance {
  const add = genRuleChain<FalsyRuleInstance>(falsyRules);
  function falsyPredicate(value: any): boolean {
    return !value;
  }
  return add(falsyPredicate);
}

export function isEmpty(): EmptyRuleInstance {
  const add = genRuleChain<EmptyRuleInstance>(emptyRules);
  function emptyPredicate(value: any): boolean {
    return isEmptyValue(value);
  }
  return add(emptyPredicate);
}

export function isNotEmpty(): NotEmptyRuleInstance {
  const add = genRuleChain<NotEmptyRuleInstance>(notEmptyRules);
  function notEmptyPredicate(value: any): boolean {
    return isNotEmptyValue(value);
  }
  return add(notEmptyPredicate);
}

export function isNaN(): NaNRuleInstance {
  const add = genRuleChain<NaNRuleInstance>(nanRules);
  function isNaNPredicate(value: any): boolean {
    return Number.isNaN(value);
  }
  return add(isNaNPredicate);
}

export function isNotNaN(): NotNaNRuleInstance {
  const add = genRuleChain<NotNaNRuleInstance>(notNanRules);
  function isNotNaNPredicate(value: any): boolean {
    return !Number.isNaN(value);
  }
  return add(isNotNaNPredicate);
}

export function condition(cond: boolean): ConditionRuleInstance {
  const add = genRuleChain<ConditionRuleInstance>(conditionRules);
  function conditionPredicate(): boolean {
    return cond;
  }
  return add(conditionPredicate);
}

export function isNotArray(): NotArrayRuleInstance {
  const add = genRuleChain<NotArrayRuleInstance>(notArrayRules);
  function notArrayPredicate(value: any): boolean {
    return !Array.isArray(value);
  }
  return add(notArrayPredicate);
}

export function isNotBoolean(): NotBooleanRuleInstance {
  const add = genRuleChain<NotBooleanRuleInstance>(notBooleanRules);
  function notBooleanPredicate(value: any): boolean {
    return typeof value !== 'boolean';
  }
  return add(notBooleanPredicate);
}

export function isNotNumber(): NotNumberRuleInstance {
  const add = genRuleChain<NotNumberRuleInstance>(notNumberRules);
  function notNumberPredicate(value: any): boolean {
    return typeof value !== 'number' || Number.isNaN(value);
  }
  return add(notNumberPredicate);
}

export function isNotString(): NotStringRuleInstance {
  const add = genRuleChain<NotStringRuleInstance>(notStringRules);
  function notStringPredicate(value: any): boolean {
    return typeof value !== 'string';
  }
  return add(notStringPredicate);
}

export function isNotNumeric(): NotNumericRuleInstance {
  const add = genRuleChain<NotNumericRuleInstance>(notNumericRules);
  function notNumericPredicate(value: any): boolean {
    return !isNumericValue(value);
  }
  return add(notNumericPredicate);
}
