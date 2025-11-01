import {
  isEmpty as isEmptyValue,
  isNotEmpty as isNotEmptyValue,
} from 'vest-utils';

import { RuleInstance } from '../../enforce';
import { equals, notEquals } from '../commonComparison';
import { inside, notInside } from '../commonContainer';
import { genRuleChain } from '../genRuleChain';

import { includes } from './includes';
import { lengthEquals } from './lengthEquals';
import { lengthNotEquals } from './lengthNotEquals';
import { longerThan } from './longerThan';
import { longerThanOrEquals } from './longerThanOrEquals';
import { maxLength } from './maxLength';
import { minLength } from './minLength';
import { shorterThan } from './shorterThan';
import { shorterThanOrEquals } from './shorterThanOrEquals';

export interface ArrayRuleInstance<T = any> extends RuleInstance<T[], [T[]]> {
  equals(arr: T[]): ArrayRuleInstance<T>;
  notEquals(arr: T[]): ArrayRuleInstance<T>;
  minLength(n: number): ArrayRuleInstance<T>;
  maxLength(n: number): ArrayRuleInstance<T>;
  lengthEquals(n: number): ArrayRuleInstance<T>;
  lengthNotEquals(n: number): ArrayRuleInstance<T>;
  longerThan(n: number): ArrayRuleInstance<T>;
  longerThanOrEquals(n: number): ArrayRuleInstance<T>;
  shorterThan(n: number): ArrayRuleInstance<T>;
  shorterThanOrEquals(n: number): ArrayRuleInstance<T>;
  includes(item: T): ArrayRuleInstance<T>;
  inside(container: T[]): ArrayRuleInstance<T>;
  notInside(container: T[]): ArrayRuleInstance<T>;
  isEmpty(): ArrayRuleInstance<T>;
  isNotEmpty(): ArrayRuleInstance<T>;
}

function isEmpty(arr: any[]): boolean {
  return Array.isArray(arr) && isEmptyValue(arr);
}

function isNotEmpty(arr: any[]): boolean {
  return Array.isArray(arr) && isNotEmptyValue(arr);
}

const rules = {
  equals,
  includes,
  inside,
  isEmpty,
  isNotEmpty,
  lengthEquals,
  lengthNotEquals,
  longerThan,
  longerThanOrEquals,
  maxLength,
  minLength,
  notEquals,
  notInside,
  shorterThan,
  shorterThanOrEquals,
};

function isArrayPredicate(value: any): boolean {
  return Array.isArray(value);
}

export function isArray<T = []>(): ArrayRuleInstance<T> {
  const add = genRuleChain<ArrayRuleInstance<T>>(rules as any);
  return add(isArrayPredicate);
}
