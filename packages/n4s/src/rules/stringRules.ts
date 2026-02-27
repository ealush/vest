/**
 * Module: `src/rules/stringRules.ts`.
 *
 * Provides `stringRules`-related runtime and type utilities used by `n4s`.
 */
import { BuildRuleInstance, ExtractRuleFunctions } from './RuleInstanceBuilder';
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
import { doesNotEndWith } from './string/doesNotEndWith';
import { doesNotStartWith } from './string/doesNotStartWith';
import { endsWith } from './string/endsWith';
import { isBlankString as isBlank } from './string/isBlankString';
import { isNotBlank } from './string/isNotBlank';
import { isString } from './string/isString';
import { matches } from './string/matches';
import { notMatches } from './string/notMatches';
import { startsWith } from './string/startsWith';

export {
  doesNotEndWith,
  doesNotStartWith,
  endsWith,
  equals,
  inside,
  isBlank,
  isNotBlank,
  isString,
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

const stringRules = {
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
} as const;

export type StringRuleInstance = BuildRuleInstance<
  string,
  [string],
  ExtractRuleFunctions<typeof stringRules>
>;
