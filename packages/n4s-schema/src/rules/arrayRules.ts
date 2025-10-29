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

const rules = {
  equals,
  notEquals,
  includes,
  inside,
  notInside,
  isEmpty: (arr: any[]) => Array.isArray(arr) && isEmptyValue(arr),
  isNotEmpty: (arr: any[]) => Array.isArray(arr) && isNotEmptyValue(arr),
  lengthEquals: (arr: any[], n: number) =>
    Array.isArray(arr) && lengthEquals(arr, n),
  lengthNotEquals: (arr: any[], n: number) =>
    Array.isArray(arr) && lengthNotEquals(arr, n),
  longerThan: (arr: any[], n: number) =>
    Array.isArray(arr) && longerThan(arr, n),
  longerThanOrEquals: (arr: any[], n: number) =>
    Array.isArray(arr) && longerThanOrEquals(arr, n),
  shorterThan: (arr: any[], n: number) =>
    Array.isArray(arr) && shorterThan(arr, n),
  shorterThanOrEquals: (arr: any[], n: number) =>
    Array.isArray(arr) && shorterThanOrEquals(arr, n),
  maxLength: (arr: any[], n: number) => Array.isArray(arr) && maxLength(arr, n),
  minLength: (arr: any[], n: number) => Array.isArray(arr) && minLength(arr, n),
};

export function isArray<T = any>(): ArrayRuleInstance<T> {
  const add = genRuleChain<ArrayRuleInstance<T>>(rules as any);
  return add(value => Array.isArray(value));
}
