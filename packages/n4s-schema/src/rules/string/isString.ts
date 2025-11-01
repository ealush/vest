import { isStringValue } from 'vest-utils';

import { RuleInstance } from '../../enforce';
import { equals, notEquals } from '../commonComparison';
import { inside, notInside } from '../commonContainer';
import {
  lengthEquals,
  lengthNotEquals,
  longerThan,
  longerThanOrEquals,
  maxLength,
  minLength,
  shorterThan,
  shorterThanOrEquals,
} from '../commonLength';
import { genRuleChain } from '../genRuleChain';

import { doesNotEndWith } from './doesNotEndWith';
import { doesNotStartWith } from './doesNotStartWith';
import { endsWith } from './endsWith';
import { isBlank } from './isBlank';
import { isNotBlank } from './isNotBlank';
import { matches } from './matches';
import { notMatches } from './notMatches';
import { startsWith } from './startsWith';

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

const rules = {
  doesNotEndWith,
  doesNotStartWith,
  endsWith,
  equals,
  inside,
  isBlank,
  isNotBlank,
  lengthEquals,
  lengthNotEquals,
  longerThan,
  longerThanOrEquals,
  matches,
  maxLength,
  minLength,
  notEquals,
  notInside,
  notMatches,
  shorterThan,
  shorterThanOrEquals,
  startsWith,
};

function isStringPredicate(value: any): boolean {
  return isStringValue(value);
}

export function isString(): StringRuleInstance {
  const add = genRuleChain<StringRuleInstance>(rules);
  return add(isStringPredicate);
}
