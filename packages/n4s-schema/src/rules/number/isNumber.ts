import { RuleInstance } from 'enforce';
import { greaterThan } from 'greaterThan';
import { isNegative } from 'isNegative';
import { numberEquals } from 'numberEquals';

import { greaterThanOrEquals } from 'greaterThanOrEquals';
import { isBetween } from 'isBetween';
import { isEven } from 'isEven';
import { isNotBetween } from 'isNotBetween';
import { isOdd } from 'isOdd';
import { isPositive } from 'isPositive';
import { lessThan } from 'lessThan';
import { lessThanOrEquals } from 'lessThanOrEquals';
import { numberNotEquals } from 'numberNotEquals';

export interface NumberRuleInstance extends RuleInstance<number, [number]> {
  isBetween(min: number, max: number): NumberRuleInstance;
  equals(n: number): NumberRuleInstance;
  greaterThan(n: number): NumberRuleInstance;
  greaterThanOrEquals(n: number): NumberRuleInstance;
  isEven(): NumberRuleInstance;
  isNegative(): NumberRuleInstance;
  isNotBetween(min: number, max: number): NumberRuleInstance;
  isOdd(): NumberRuleInstance;
  isPositive(): NumberRuleInstance;
  lessThan(n: number): NumberRuleInstance;
  lessThanOrEquals(n: number): NumberRuleInstance;
  numberEquals(n: number | string): NumberRuleInstance;
  numberNotEquals(n: number | string): NumberRuleInstance;
}

export const numberRules = {
  equals: numberEquals,
  greaterThan,
  greaterThanOrEquals,
  isBetween,
  isEven,
  isNegative,
  isNotBetween,
  isOdd,
  isPositive,
  lessThan,
  lessThanOrEquals,
  notEquals: numberNotEquals,
  numberEquals,
  numberNotEquals,
};

export function isNumber(value: any): boolean {
  return typeof value === 'number' && !Number.isNaN(value);
}
