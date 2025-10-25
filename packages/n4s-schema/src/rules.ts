import { BuildRule, RuleRunReturn, ruleRunReturn } from './enforce';

function isString(value: any): RuleRunReturn<string> {
  return ruleRunReturn(typeof value === 'string', '');
}
export const isStringRule = BuildRule(isString);

function endsWith(value: string, ending: string): RuleRunReturn<boolean> {
  return ruleRunReturn(value.endsWith(ending), value.endsWith(ending));
}
export const endsWithRule = BuildRule(endsWith);

function equals<T>(a: T, b: T): RuleRunReturn<boolean> {
  return ruleRunReturn(a === b, a === b);
}
export const equalsRule = BuildRule(equals);

function greaterThanOrEquals(a: number, b: number): RuleRunReturn<boolean> {
  return ruleRunReturn(a >= b, a >= b);
}
export const greaterThanOrEqualsRule = BuildRule(greaterThanOrEquals);

function inside<T>(value: T, arr: T[]): RuleRunReturn<boolean> {
  return ruleRunReturn(arr.includes(value), arr.includes(value));
}
export const insideRule = BuildRule(inside);

function isBetween(
  value: number,
  min: number,
  max: number,
): RuleRunReturn<boolean> {
  return ruleRunReturn(
    value >= min && value <= max,
    value >= min && value <= max,
  );
}
export const isBetweenRule = BuildRule(isBetween);

function isBlank(value: string): RuleRunReturn<boolean> {
  return ruleRunReturn(value.trim() === '', value.trim() === '');
}
export const isBlankRule = BuildRule(isBlank);

function isBoolean(value: any): RuleRunReturn<boolean> {
  return ruleRunReturn(typeof value === 'boolean', typeof value === 'boolean');
}

export const isBooleanRule = BuildRule(isBoolean);

function isEven(value: number): RuleRunReturn<boolean> {
  return ruleRunReturn(value % 2 === 0, value % 2 === 0);
}
export const isEvenRule = BuildRule(isEven);

function isKeyOf<T extends object>(
  key: string,
  obj: T,
): RuleRunReturn<boolean> {
  return ruleRunReturn(key in obj, key in obj);
}
export const isKeyOfRule = BuildRule(isKeyOf);

function isNaN(value: any): RuleRunReturn<boolean> {
  return ruleRunReturn(Number.isNaN(value), Number.isNaN(value));
}
export const isNaNRule = BuildRule(isNaN);

function isNegative(value: number): RuleRunReturn<boolean> {
  return ruleRunReturn(value < 0, value < 0);
}
export const isNegativeRule = BuildRule(isNegative);

function isNumber(value: any): RuleRunReturn<number> {
  return ruleRunReturn(typeof value === 'number', value);
}
export const isNumberRule = BuildRule(isNumber);

function isOdd(value: number): RuleRunReturn<boolean> {
  return ruleRunReturn(value % 2 !== 0, value % 2 !== 0);
}
export const isOddRule = BuildRule(isOdd);

function isTruthy(value: any): RuleRunReturn<boolean> {
  return ruleRunReturn(!!value, !!value);
}
export const isTruthyRule = BuildRule(isTruthy);

function isValueOf<T>(
  value: T,
  obj: Record<string, T>,
): RuleRunReturn<boolean> {
  return ruleRunReturn(
    Object.values(obj).includes(value),
    Object.values(obj).includes(value),
  );
}
export const isValueOfRule = BuildRule(isValueOf);

function lessThan(a: number, b: number): RuleRunReturn<boolean> {
  return ruleRunReturn(a < b, a < b);
}
export const lessThanRule = BuildRule(lessThan);

function lessThanOrEquals(a: number, b: number): RuleRunReturn<boolean> {
  return ruleRunReturn(a <= b, a <= b);
}
export const lessThanOrEqualsRule = BuildRule(lessThanOrEquals);

function longerThanOrEquals(a: string, b: number): RuleRunReturn<boolean> {
  return ruleRunReturn(a.length >= b, a.length >= b);
}
export const longerThanOrEqualsRule = BuildRule(longerThanOrEquals);

function matches(value: string, regex: RegExp): RuleRunReturn<boolean> {
  return ruleRunReturn(regex.test(value), regex.test(value));
}
export const matchesRule = BuildRule(matches);

function ruleCondition(condition: boolean): RuleRunReturn<boolean> {
  return ruleRunReturn(condition, condition);
}
export const ruleConditionRule = BuildRule(ruleCondition);

function shorterThan(a: string, b: number): RuleRunReturn<boolean> {
  return ruleRunReturn(a.length < b, a.length < b);
}
export const shorterThanRule = BuildRule(shorterThan);

function shorterThanOrEquals(a: string, b: number): RuleRunReturn<boolean> {
  return ruleRunReturn(a.length <= b, a.length <= b);
}
export const shorterThanOrEqualsRule = BuildRule(shorterThanOrEquals);

function startsWith(value: string, start: string): RuleRunReturn<string> {
  return ruleRunReturn(value.startsWith(start), value);
}
export const startsWithRule = BuildRule(startsWith);
