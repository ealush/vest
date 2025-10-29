import {
  isNumeric as isNumericValue,
  numberEquals as numberEqualsValue,
  numberNotEquals as numberNotEqualsValue,
} from 'vest-utils';

import { RuleInstance } from '../enforce';

import {
  equals as equalsBase,
  notEquals as notEqualsBase,
} from './commonComparison';
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
} from './commonNumeric';
import { genRuleChain } from './genRuleChain';

export interface NumericRuleInstance extends RuleInstance<number, [any]> {
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

const rules = {
  between: adapt1(betweenBase),
  notBetween: adapt1(
    (v: number, min: number, max: number) => v < min || v > max,
  ),
  isBetween: adapt1(betweenBase),
  isNotBetween: adapt1(
    (v: number, min: number, max: number) => v < min || v > max,
  ),
  equals: adapt1(equalsBase),
  notEquals: adapt1(notEqualsBase),
  greaterThan: adapt1(greaterThanBase),
  greaterThanOrEquals: adapt1(greaterThanOrEqualsBase),
  isEven: adapt1(isEvenBase),
  isNaN: adapt1((v: number) => Number.isNaN(v)),
  isNotNaN: adapt1((v: number) => !Number.isNaN(v)),
  isNegative: adapt1(isNegativeBase),
  isOdd: adapt1(isOddBase),
  isPositive: adapt1(isPositiveBase),
  lessThan: adapt1(lessThanBase),
  lessThanOrEquals: adapt1(lessThanOrEqualsBase),
  numberEquals: (value: unknown, n: number | string) =>
    numberEqualsValue(value as any, n as any),
  numberNotEquals: (value: unknown, n: number | string) =>
    numberNotEqualsValue(value as any, n as any),
};

export function isNumeric(): NumericRuleInstance {
  const add = genRuleChain<NumericRuleInstance>(rules);
  return add(value => isNumericValue(value));
}
