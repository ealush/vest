import { RuleInstance } from 'enforce';
import { equals } from 'equals';
import { greaterThanOrEquals } from 'greaterThanOrEquals';
import { isBetween } from 'isBetween';
import { isEven } from 'isEven';
import { isNaN } from 'isNaN';
import { isNegative } from 'isNegative';
import { isOdd } from 'isOdd';
import { lessThan } from 'lessThan';
import { lessThanOrEquals } from 'lessThanOrEquals';
import { isNumeric as isNumericValue } from 'vest-utils';

import { greaterThan } from 'greaterThan';
import { isNotBetween } from 'isNotBetween';
import { isNotNaN } from 'isNotNaN';
import { isPositive } from 'isPositive';
import { numberEquals } from 'numberEquals';
import { numberNotEquals } from 'numberNotEquals';

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

export const numericRules = {
  equals,
  greaterThan,
  greaterThanOrEquals,
  isBetween,
  isEven,
  isNaN,
  isNegative,
  isNotBetween,
  isNotNaN,
  isOdd,
  isPositive,
  lessThan,
  lessThanOrEquals,
  numberEquals,
  numberNotEquals,
};

export function isNumeric(value: any): boolean {
  // Accept numbers (including Infinity) and numeric strings
  if (typeof value === 'number') {
    return !Number.isNaN(value);
  }
  // For strings, use the vest-utils isNumeric which excludes Infinity strings
  return isNumericValue(value);
}
