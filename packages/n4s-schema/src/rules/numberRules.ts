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
  isNaN(): NumberRuleInstance;
  isNotNaN(): NumberRuleInstance;
}

const rules = {
  between,
  notBetween: (value: number, min: number, max: number) =>
    value < min || value > max,
  isBetween: between,
  isNotBetween: (value: number, min: number, max: number) =>
    value < min || value > max,
  equals,
  notEquals,
  greaterThan,
  greaterThanOrEquals,
  isEven,
  isNaN: (value: number) => Number.isNaN(value),
  isNotNaN: (value: number) => !Number.isNaN(value),
  isNegative,
  isOdd,
  isPositive,
  lessThan,
  lessThanOrEquals,
  numberEquals: (value: number, n: number | string) =>
    numberEqualsValue(value, n as any),
  numberNotEquals: (value: number, n: number | string) =>
    numberNotEqualsValue(value, n as any),
};

export function isNumber(): NumberRuleInstance {
  const add = genRuleChain<NumberRuleInstance>(rules);
  return add(value => typeof value === 'number' && !Number.isNaN(value));
}
