import { isEmpty, isNotEmpty } from 'vest-utils';

import { BuildRuleInstance, ExtractRuleFunctions } from './RuleInstanceBuilder';
import { includes } from './array/includes';
import { isArray } from './array/isArrayRule';
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
import { isNotArray } from './general/isNotArray';

export {
  equals,
  includes,
  inside,
  isArray,
  isEmpty,
  isNotArray,
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

const arrayRules = {
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
} as const;

export type ArrayRuleInstance<T = any> = BuildRuleInstance<
  T[],
  [T[]],
  ExtractRuleFunctions<typeof arrayRules>
>;
