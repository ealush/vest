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
export interface BlankRuleInstance extends RuleInstance<any, [any]> {}
export interface NotBlankRuleInstance extends RuleInstance<any, [any]> {}
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
const blankRules = {};
const notBlankRules = {};
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
  return add(value => !!value);
}

export function isFalsy(): FalsyRuleInstance {
  const add = genRuleChain<FalsyRuleInstance>(falsyRules);
  return add(value => !value);
}

export function isEmpty(): EmptyRuleInstance {
  const add = genRuleChain<EmptyRuleInstance>(emptyRules);
  return add(value => isEmptyValue(value));
}

export function isNotEmpty(): NotEmptyRuleInstance {
  const add = genRuleChain<NotEmptyRuleInstance>(notEmptyRules);
  return add(value => isNotEmptyValue(value));
}

export function isBlank(): BlankRuleInstance {
  const add = genRuleChain<BlankRuleInstance>(blankRules);
  return add(
    value =>
      value == null || (typeof value === 'string' && value.trim().length === 0),
  );
}

export function isNotBlank(): NotBlankRuleInstance {
  const add = genRuleChain<NotBlankRuleInstance>(notBlankRules);
  return add(
    value =>
      !(
        value == null ||
        (typeof value === 'string' && value.trim().length === 0)
      ),
  );
}

export function isNaN(): NaNRuleInstance {
  const add = genRuleChain<NaNRuleInstance>(nanRules);
  return add(value => Number.isNaN(value));
}

export function isNotNaN(): NotNaNRuleInstance {
  const add = genRuleChain<NotNaNRuleInstance>(notNanRules);
  return add(value => !Number.isNaN(value));
}

export function condition(cond: boolean): ConditionRuleInstance {
  const add = genRuleChain<ConditionRuleInstance>(conditionRules);
  return add(() => cond);
}

export function isNotArray(): NotArrayRuleInstance {
  const add = genRuleChain<NotArrayRuleInstance>(notArrayRules);
  return add(value => !Array.isArray(value));
}

export function isNotBoolean(): NotBooleanRuleInstance {
  const add = genRuleChain<NotBooleanRuleInstance>(notBooleanRules);
  return add(value => typeof value !== 'boolean');
}

export function isNotNumber(): NotNumberRuleInstance {
  const add = genRuleChain<NotNumberRuleInstance>(notNumberRules);
  return add(value => typeof value !== 'number' || Number.isNaN(value));
}

export function isNotString(): NotStringRuleInstance {
  const add = genRuleChain<NotStringRuleInstance>(notStringRules);
  return add(value => typeof value !== 'string');
}

export function isNotNumeric(): NotNumericRuleInstance {
  const add = genRuleChain<NotNumericRuleInstance>(notNumericRules);
  return add(value => !isNumericValue(value));
}
