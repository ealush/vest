import { isStringValue } from 'vest-utils';

import { RuleInstance } from '../enforce';

import { equals, notEquals } from './commonComparison';
import { inside, notInside } from './commonContainer';
import {
  lengthEquals,
  lengthNotEquals,
  longerThan,
  longerThanOrEquals,
  maxLength,
  minLength,
  shorterThan,
  shorterThanOrEquals,
} from './commonLength';
import { genRuleChain } from './genRuleChain';

export interface StringRuleInstance extends RuleInstance<string, [any]> {
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

function startsWith(str: string, start: string): boolean {
  return str.startsWith(start);
}

function endsWith(str: string, ending: string): boolean {
  return str.endsWith(ending);
}

function toRegExp(regex: RegExp | string): RegExp | null {
  if (regex instanceof RegExp) return regex;
  if (typeof regex === 'string') return new RegExp(regex);
  return null;
}

function matches(str: string, regex: RegExp | string): boolean {
  const r = toRegExp(regex);
  return !!r && r.test(str);
}
function notMatches(str: string, regex: RegExp | string): boolean {
  const r = toRegExp(regex);
  return !!r && !r.test(str);
}

function doesNotEndWith(str: string, ending: string): boolean {
  return !endsWith(str, ending);
}

function doesNotStartWith(str: string, start: string): boolean {
  return !startsWith(str, start);
}

function isBlankRule(str: string): boolean {
  return str.trim().length === 0;
}

function isNotBlankRule(str: string): boolean {
  return str.trim().length > 0;
}

const rules = {
  doesNotEndWith,
  doesNotStartWith,
  endsWith,
  equals,
  isBlank: isBlankRule,
  isNotBlank: isNotBlankRule,
  inside,
  matches,
  notEquals,
  notInside,
  notMatches,
  maxLength,
  minLength,
  lengthEquals,
  lengthNotEquals,
  longerThan,
  longerThanOrEquals,
  shorterThan,
  shorterThanOrEquals,
  startsWith,
};

export function isString(): StringRuleInstance {
  const add = genRuleChain<StringRuleInstance>(rules);
  function isStringPredicate(value: any): boolean {
    return isStringValue(value);
  }
  return add(isStringPredicate);
}
