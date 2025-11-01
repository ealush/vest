import { RuleInstance } from 'enforce';
import { greaterThanOrEquals } from 'greaterThanOrEquals';
import { isEven } from 'isEven';
import { isNegative } from 'isNegative';
import { isOdd } from 'isOdd';
import { lessThan } from 'lessThan';
import { lessThanOrEquals } from 'lessThanOrEquals';

import { between } from 'between';
import { greaterThan } from 'greaterThan';
import { isPositive } from 'isPositive';
import { notBetween } from 'notBetween';
import { numberEquals } from 'numberEquals';
import { numberNotEquals } from 'numberNotEquals';

export interface NumberRuleInstance extends RuleInstance<number, [number]> {
  between(min: number, max: number): NumberRuleInstance;
  equals(n: number): NumberRuleInstance;
  greaterThan(n: number): NumberRuleInstance;
  greaterThanOrEquals(n: number): NumberRuleInstance;
  isBetween(min: number, max: number): NumberRuleInstance;
  isEven(): NumberRuleInstance;
  isNegative(): NumberRuleInstance;
  isNotBetween(min: number, max: number): NumberRuleInstance;
  isOdd(): NumberRuleInstance;
  isPositive(): NumberRuleInstance;
  lessThan(n: number): NumberRuleInstance;
  lessThanOrEquals(n: number): NumberRuleInstance;
  notBetween(min: number, max: number): NumberRuleInstance;
  notEquals(n: number): NumberRuleInstance;
  numberEquals(n: number | string): NumberRuleInstance;
  numberNotEquals(n: number | string): NumberRuleInstance;
}

export const numberRules = {
  between,
  equals: numberEquals,
  greaterThan,
  greaterThanOrEquals,
  isBetween: between,
  isEven,
  isNegative,
  isNotBetween: notBetween,
  isOdd,
  isPositive,
  lessThan,
  lessThanOrEquals,
  notBetween,
  notEquals: numberNotEquals,
  numberEquals,
  numberNotEquals,
};

export function isNumber(value: any): boolean {
  return typeof value === 'number' && !Number.isNaN(value);
}
