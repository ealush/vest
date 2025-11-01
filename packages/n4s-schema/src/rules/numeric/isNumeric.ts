import { isNumeric as isNumericValue } from 'vest-utils';

import { RuleInstance } from '../../enforce';
import { genRuleChain } from '../genRuleChain';
import { between as numberBetween } from '../number/between';
import { greaterThan as numberGreaterThan } from '../number/greaterThan';
import { greaterThanOrEquals as numberGreaterThanOrEquals } from '../number/greaterThanOrEquals';
import { isEven as numberIsEven } from '../number/isEven';
import { isNegative as numberIsNegative } from '../number/isNegative';
import { isOdd as numberIsOdd } from '../number/isOdd';
import { isPositive as numberIsPositive } from '../number/isPositive';
import { lessThan as numberLessThan } from '../number/lessThan';
import { lessThanOrEquals as numberLessThanOrEquals } from '../number/lessThanOrEquals';
import { notBetween as numberNotBetween } from '../number/notBetween';
import { numberEquals as numberNumberEquals } from '../number/numberEquals';
import { numberNotEquals as numberNumberNotEquals } from '../number/numberNotEquals';

import { toNumber } from './toNumber';

export interface NumericRuleInstance
  extends RuleInstance<number | string, [number | string]> {
  between(min: number, max: number): NumericRuleInstance;
  equals(n: number): NumericRuleInstance;
  greaterThan(n: number): NumericRuleInstance;
  greaterThanOrEquals(n: number): NumericRuleInstance;
  isBetween(min: number, max: number): NumericRuleInstance;
  isEven(): NumericRuleInstance;
  isNaN(): NumericRuleInstance;
  isNegative(): NumericRuleInstance;
  isNotBetween(min: number, max: number): NumericRuleInstance;
  isNotNaN(): NumericRuleInstance;
  isOdd(): NumericRuleInstance;
  isPositive(): NumericRuleInstance;
  lessThan(n: number): NumericRuleInstance;
  lessThanOrEquals(n: number): NumericRuleInstance;
  notBetween(min: number, max: number): NumericRuleInstance;
  notEquals(n: number): NumericRuleInstance;
  numberEquals(n: number | string): NumericRuleInstance;
  numberNotEquals(n: number | string): NumericRuleInstance;
}

function numericEquals(value: number | string, n: number): boolean {
  const v = toNumber(value);
  return v === n;
}

function numericNotEquals(value: number | string, n: number): boolean {
  const v = toNumber(value);
  return v !== n;
}

function isNaNNum(value: number | string): boolean {
  const v = toNumber(value);
  return v !== null && Number.isNaN(v);
}

function isNotNaNNum(value: number | string): boolean {
  const v = toNumber(value);
  return v !== null && !Number.isNaN(v);
}

// Wrapper functions that convert string to number then call number predicates
function between(value: number | string, min: number, max: number): boolean {
  const v = toNumber(value);
  return v !== null && numberBetween(v, min, max);
}

function greaterThan(value: number | string, n: number): boolean {
  const v = toNumber(value);
  return v !== null && numberGreaterThan(v, n);
}

function greaterThanOrEquals(value: number | string, n: number): boolean {
  const v = toNumber(value);
  return v !== null && numberGreaterThanOrEquals(v, n);
}

function lessThan(value: number | string, n: number): boolean {
  const v = toNumber(value);
  return v !== null && numberLessThan(v, n);
}

function lessThanOrEquals(value: number | string, n: number): boolean {
  const v = toNumber(value);
  return v !== null && numberLessThanOrEquals(v, n);
}

function notBetween(value: number | string, min: number, max: number): boolean {
  const v = toNumber(value);
  return v !== null && numberNotBetween(v, min, max);
}

function isEven(value: number | string): boolean {
  const v = toNumber(value);
  return v !== null && numberIsEven(v);
}

function isOdd(value: number | string): boolean {
  const v = toNumber(value);
  return v !== null && numberIsOdd(v);
}

function isPositive(value: number | string): boolean {
  const v = toNumber(value);
  return v !== null && numberIsPositive(v);
}

function isNegative(value: number | string): boolean {
  const v = toNumber(value);
  return v !== null && numberIsNegative(v);
}

function numberEquals(value: number | string, n: number | string): boolean {
  const v = toNumber(value);
  const nVal = toNumber(n);
  return v !== null && nVal !== null && numberNumberEquals(v, nVal);
}

function numberNotEquals(value: number | string, n: number | string): boolean {
  const v = toNumber(value);
  const nVal = toNumber(n);
  return v !== null && nVal !== null && numberNumberNotEquals(v, nVal);
}

const rules = {
  between,
  equals: numericEquals,
  greaterThan,
  greaterThanOrEquals,
  isBetween: between,
  isEven,
  isNaN: isNaNNum,
  isNegative,
  isNotBetween: notBetween,
  isNotNaN: isNotNaNNum,
  isOdd,
  isPositive,
  lessThan,
  lessThanOrEquals,
  notBetween,
  notEquals: numericNotEquals,
  numberEquals,
  numberNotEquals,
};

function isNumericPredicate(value: any): boolean {
  // Accept numbers (including Infinity) and numeric strings
  if (typeof value === 'number') {
    return !Number.isNaN(value);
  }
  // For strings, use the vest-utils isNumeric which excludes Infinity strings
  return isNumericValue(value);
}

export function isNumeric(): NumericRuleInstance {
  const add = genRuleChain<NumericRuleInstance>(rules);
  return add(isNumericPredicate);
}
