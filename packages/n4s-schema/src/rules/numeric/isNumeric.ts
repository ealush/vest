import {
  isNumeric as isNumericValue,
  numberEquals as numberEqualsValue,
  numberNotEquals as numberNotEqualsValue,
} from 'vest-utils';

import { RuleInstance } from '../../enforce';
import {
  equals as equalsBase,
  notEquals as notEqualsBase,
} from '../commonComparison';
import {
  between as betweenBase,
  greaterThan as greaterThanBase,
  greaterThanOrEquals as greaterThanOrEqualsBase,
  isEven as isEvenBase,
  isNegative as isNegativeBase,
  isOdd as isOddBase,
  isPositive as isPositiveBase,
  lessThan as lessThanBase,
  lessThanOrEquals as lessThanOrEqualsBase,
} from '../commonNumeric';
import { genRuleChain } from '../genRuleChain';

export interface NumericRuleInstance
  extends RuleInstance<number | string, [number | string]> {
  equals(n: number): NumericRuleInstance;
  notEquals(n: number): NumericRuleInstance;
  greaterThan(n: number): NumericRuleInstance;
  greaterThanOrEquals(n: number): NumericRuleInstance;
  lessThan(n: number): NumericRuleInstance;
  lessThanOrEquals(n: number): NumericRuleInstance;
  between(min: number, max: number): NumericRuleInstance;
  notBetween(min: number, max: number): NumericRuleInstance;
  isBetween(min: number, max: number): NumericRuleInstance;
  isNotBetween(min: number, max: number): NumericRuleInstance;
  numberEquals(n: number | string): NumericRuleInstance;
  numberNotEquals(n: number | string): NumericRuleInstance;
  isEven(): NumericRuleInstance;
  isOdd(): NumericRuleInstance;
  isPositive(): NumericRuleInstance;
  isNegative(): NumericRuleInstance;
  isNaN(): NumericRuleInstance;
  isNotNaN(): NumericRuleInstance;
}

function toNumber(value: unknown): number | null {
  if (typeof value === 'number') return value;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

function adapt1<A extends any[]>(
  fn: (value: number, ...args: A) => boolean,
): (value: unknown, ...args: A) => boolean {
  return (value: unknown, ...args: A) => {
    const v = toNumber(value);
    return v !== null && fn(v, ...args);
  };
}

function notBetweenNum(v: number, min: number, max: number): boolean {
  return v < min || v > max;
}

function isNaNNum(v: number): boolean {
  return Number.isNaN(v);
}

function isNotNaNNum(v: number): boolean {
  return !Number.isNaN(v);
}

const rules = {
  between: adapt1(betweenBase),
  equals: adapt1((a: number, b: number) => equalsBase(a, b)),
  greaterThan: adapt1(greaterThanBase),
  greaterThanOrEquals: adapt1(greaterThanOrEqualsBase),
  isBetween: adapt1(betweenBase),
  isEven: adapt1(isEvenBase),
  isNaN: adapt1(isNaNNum),
  isNegative: adapt1(isNegativeBase),
  isNotBetween: adapt1(notBetweenNum),
  isNotNaN: adapt1(isNotNaNNum),
  isOdd: adapt1(isOddBase),
  isPositive: adapt1(isPositiveBase),
  lessThan: adapt1(lessThanBase),
  lessThanOrEquals: adapt1(lessThanOrEqualsBase),
  notBetween: adapt1(notBetweenNum),
  notEquals: adapt1((a: number, b: number) => notEqualsBase(a, b)),
  numberEquals: (value: unknown, n: number | string) =>
    numberEqualsValue(value as any, n as any),
  numberNotEquals: (value: unknown, n: number | string) =>
    numberNotEqualsValue(value as any, n as any),
};

function isNumericPredicate(value: any): boolean {
  return isNumericValue(value);
}

export function isNumeric(): NumericRuleInstance {
  const add = genRuleChain<Omit<NumericRuleInstance, '__accepts'>>(rules);
  return add(isNumericPredicate);
}
