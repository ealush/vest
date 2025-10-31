import {
  isEmpty as isEmptyValue,
  isNotEmpty as isNotEmptyValue,
} from 'vest-utils';

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

export interface ArrayRuleInstance<T = any> extends RuleInstance<T[], [any]> {
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

function includes<T>(arr: T[], item: T): boolean {
  return Array.isArray(arr) && arr.includes(item as any);
}

function isEmptyArr(arr: any[]): boolean {
  return Array.isArray(arr) && isEmptyValue(arr);
}

function isNotEmptyArr(arr: any[]): boolean {
  return Array.isArray(arr) && isNotEmptyValue(arr);
}

function lengthEqualsArr(arr: any[], n: number): boolean {
  return Array.isArray(arr) && lengthEquals(arr, n);
}

function lengthNotEqualsArr(arr: any[], n: number): boolean {
  return Array.isArray(arr) && lengthNotEquals(arr, n);
}

function longerThanArr(arr: any[], n: number): boolean {
  return Array.isArray(arr) && longerThan(arr, n);
}

function longerThanOrEqualsArr(arr: any[], n: number): boolean {
  return Array.isArray(arr) && longerThanOrEquals(arr, n);
}

function shorterThanArr(arr: any[], n: number): boolean {
  return Array.isArray(arr) && shorterThan(arr, n);
}

function shorterThanOrEqualsArr(arr: any[], n: number): boolean {
  return Array.isArray(arr) && shorterThanOrEquals(arr, n);
}

function maxLengthArr(arr: any[], n: number): boolean {
  return Array.isArray(arr) && maxLength(arr, n);
}

function minLengthArr(arr: any[], n: number): boolean {
  return Array.isArray(arr) && minLength(arr, n);
}

const rules = {
  equals,
  notEquals,
  includes,
  inside,
  notInside,
  isEmpty: isEmptyArr,
  isNotEmpty: isNotEmptyArr,
  lengthEquals: lengthEqualsArr,
  lengthNotEquals: lengthNotEqualsArr,
  longerThan: longerThanArr,
  longerThanOrEquals: longerThanOrEqualsArr,
  shorterThan: shorterThanArr,
  shorterThanOrEquals: shorterThanOrEqualsArr,
  maxLength: maxLengthArr,
  minLength: minLengthArr,
};

export function isArray<T = []>(): ArrayRuleInstance<T> {
  const add = genRuleChain<ArrayRuleInstance<T>>(rules as any);
  function isArrayPredicate(value: any): boolean {
    return Array.isArray(value);
  }
  return add(isArrayPredicate);
}
