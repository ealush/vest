import { BuildRuleInstance, ExtractRuleFunctions } from 'RuleInstanceBuilder';
import { equals, notEquals } from 'commonComparison';
import { inside, notInside } from 'commonContainer';
import {
  lengthEquals,
  lengthNotEquals,
  longerThan,
  longerThanOrEquals,
  maxLength,
  minLength,
  shorterThan,
  shorterThanOrEquals,
} from 'commonLength';
import { doesNotEndWith } from 'doesNotEndWith';
import { doesNotStartWith } from 'doesNotStartWith';
import { endsWith } from 'endsWith';
import { isBlankString as isBlank } from 'isBlankString';
import { isNotBlank } from 'isNotBlank';
import { isString } from 'isString';
import { matches } from 'matches';
import { notMatches } from 'notMatches';
import { startsWith } from 'startsWith';

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
