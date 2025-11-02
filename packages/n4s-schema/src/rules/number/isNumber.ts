import { RuleInstance } from 'enforceUtil';

export interface NumberRuleInstance extends RuleInstance<number, [number]> {
  isBetween(min: number, max: number): NumberRuleInstance;
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
  isNumber(): NumberRuleInstance;
  isNaN(): NumberRuleInstance;
  isNotNaN(): NumberRuleInstance;
}

export function isNumber(value: any): boolean {
  return typeof value === 'number' && !Number.isNaN(value);
}
