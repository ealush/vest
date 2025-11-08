import { BuildRuleInstance, ExtractRuleFunctions } from 'RuleInstanceBuilder';
import { endsWith } from 'endsWith';
import { isBlank } from 'isBlank';
import { isString } from 'isString';
import { matches } from 'matches';
import { startsWith } from 'startsWith';

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
import { isNotBlank } from 'isNotBlank';
import { notMatches } from 'notMatches';

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
