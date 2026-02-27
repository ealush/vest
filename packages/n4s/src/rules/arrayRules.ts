/**
 * Module: `src/rules/arrayRules.ts`.
 *
 * Provides `arrayRules`-related runtime and type utilities used by `n4s`.
 */
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

export type ArrayRuleInstance<T = any, TInput = T> = BuildRuleInstance<
  T[],
  [TInput[]],
  ExtractRuleFunctions<typeof arrayRules>
>;
