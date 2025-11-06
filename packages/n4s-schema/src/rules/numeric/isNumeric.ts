import { isNumeric as isNumericValue } from 'vest-utils';

import { RuleInstance } from 'RuleInstance';

export interface NumericRuleInstance
  extends RuleInstance<number | string, [number | string]> {
  isBetween(min: number, max: number): NumericRuleInstance;
  greaterThan(n: number): NumericRuleInstance;
  greaterThanOrEquals(n: number): NumericRuleInstance;
  isEven(): NumericRuleInstance;
  isNaN(): NumericRuleInstance;
  isNegative(): NumericRuleInstance;
  isNotNaN(): NumericRuleInstance;
  isOdd(): NumericRuleInstance;
  isPositive(): NumericRuleInstance;
  lessThan(n: number): NumericRuleInstance;
  lessThanOrEquals(n: number): NumericRuleInstance;
  isNotBetween(min: number, max: number): NumericRuleInstance;
  numberEquals(n: number | string): NumericRuleInstance;
  numberNotEquals(n: number | string): NumericRuleInstance;
  isNumeric(): NumericRuleInstance;
}

export function isNumeric(value: any): boolean {
  // Accept numbers (including Infinity) and numeric strings
  if (typeof value === 'number') {
    return !Number.isNaN(value);
  }
  // For strings, use the vest-utils isNumeric which excludes Infinity strings
  return isNumericValue(value);
}
