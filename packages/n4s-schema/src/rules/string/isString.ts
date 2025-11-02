import { RuleInstance } from 'enforceUtil';

export { isStringValue as isString } from 'vest-utils';

export interface StringRuleInstance extends RuleInstance<string, [string]> {
  equals(s: string): StringRuleInstance;
  notEquals(s: string): StringRuleInstance;
  startsWith(start: string): StringRuleInstance;
  endsWith(ending: string): StringRuleInstance;
  matches(regex: RegExp | string): StringRuleInstance;
  notMatches(regex: RegExp | string): StringRuleInstance;
  doesNotStartWith(start: string): StringRuleInstance;
  doesNotEndWith(ending: string): StringRuleInstance;
  inside(container: string | string[]): StringRuleInstance;
  notInside(container: string | string[]): StringRuleInstance;
  isBlank(): StringRuleInstance;
  isNotBlank(): StringRuleInstance;
  minLength(n: number): StringRuleInstance; // alias for length >= n
  maxLength(n: number): StringRuleInstance; // alias for length <= n
  lengthEquals(n: number): StringRuleInstance;
  lengthNotEquals(n: number): StringRuleInstance;
  longerThan(n: number): StringRuleInstance; // length > n
  longerThanOrEquals(n: number): StringRuleInstance; // length >= n
  shorterThan(n: number): StringRuleInstance; // length < n
  shorterThanOrEquals(n: number): StringRuleInstance; // length <= n
}
