import {
  numberEquals as numberEqualsValue,
  numberNotEquals as numberNotEqualsValue,
} from 'vest-utils';

import { RuleInstance } from '../enforce';

import { equals, notEquals } from './commonComparison';
import {
  between,
  greaterThan,
  greaterThanOrEquals,
  isEven,
  isNegative,
  isOdd,
  isPositive,
  lessThan,
  lessThanOrEquals,
} from './commonNumeric';
import { genRuleChain } from './genRuleChain';

export interface NumberRuleInstance extends RuleInstance<number, [any]> {
  equals(n: number): NumberRuleInstance;
  notEquals(n: number): NumberRuleInstance;
  greaterThan(n: number): NumberRuleInstance;
  greaterThanOrEquals(n: number): NumberRuleInstance;
  lessThan(n: number): NumberRuleInstance;
  lessThanOrEquals(n: number): NumberRuleInstance;
  between(min: number, max: number): NumberRuleInstance;
  notBetween(min: number, max: number): NumberRuleInstance;
  isBetween(min: number, max: number): NumberRuleInstance;
  isNotBetween(min: number, max: number): NumberRuleInstance;
  numberEquals(n: number | string): NumberRuleInstance;
  numberNotEquals(n: number | string): NumberRuleInstance;
  isEven(): NumberRuleInstance;
  isOdd(): NumberRuleInstance;
  isPositive(): NumberRuleInstance;
  isNegative(): NumberRuleInstance;
}

const rules = {
  between,
  notBetween: notBetweenRule,
  isBetween: between,
  isNotBetween: isNotBetweenRule,
  equals,
  notEquals,
  greaterThan,
  greaterThanOrEquals,
  isEven,
  isNegative,
  isOdd,
  isPositive,
  lessThan,
  lessThanOrEquals,
  numberEquals: numberEqualsRule,
  numberNotEquals: numberNotEqualsRule,
};

export function isNumber(): NumberRuleInstance {
  const add = genRuleChain<NumberRuleInstance>(rules);
  function isNumberPredicate(value: any): boolean {
    return typeof value === 'number' && !Number.isNaN(value);
  }
  return add(isNumberPredicate);
}

function notBetweenRule(value: number, min: number, max: number): boolean {
  return value < min || value > max;
}

function isNotBetweenRule(value: number, min: number, max: number): boolean {
  return value < min || value > max;
}

function numberEqualsRule(value: number, n: number | string): boolean {
  return numberEqualsValue(value, n as any);
}

function numberNotEqualsRule(value: number, n: number | string): boolean {
  return numberNotEqualsValue(value, n as any);
}
