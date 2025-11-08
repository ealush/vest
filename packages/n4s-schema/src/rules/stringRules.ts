import { endsWith } from 'endsWith';
import { isBlank } from 'isBlank';
import { isString } from 'isString';
import { matches } from 'matches';
import { startsWith } from 'startsWith';
import { type DropFirst } from 'vest-utils';

import { RuleInstance } from 'RuleInstance';
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
  equals,
  isString,
  endsWith,
  isBlank,
  matches,
  startsWith,
  notEquals,
  inside,
  notInside,
  lengthEquals,
  lengthNotEquals,
  longerThan,
  longerThanOrEquals,
  maxLength,
  minLength,
  shorterThan,
  shorterThanOrEquals,
  doesNotEndWith,
  doesNotStartWith,
  isNotBlank,
  notMatches,
};

export interface StringRuleInstance extends RuleInstance<string, [string]> {
  equals(
    ...args: DropFirst<Parameters<typeof equals<string>>>
  ): StringRuleInstance;
  notEquals(
    ...args: DropFirst<Parameters<typeof notEquals>>
  ): StringRuleInstance;
  startsWith(
    ...args: DropFirst<Parameters<typeof startsWith>>
  ): StringRuleInstance;
  endsWith(...args: DropFirst<Parameters<typeof endsWith>>): StringRuleInstance;
  matches(...args: DropFirst<Parameters<typeof matches>>): StringRuleInstance;
  notMatches(
    ...args: DropFirst<Parameters<typeof notMatches>>
  ): StringRuleInstance;
  doesNotStartWith(
    ...args: DropFirst<Parameters<typeof doesNotStartWith>>
  ): StringRuleInstance;
  doesNotEndWith(
    ...args: DropFirst<Parameters<typeof doesNotEndWith>>
  ): StringRuleInstance;
  inside(...args: DropFirst<Parameters<typeof inside>>): StringRuleInstance;
  notInside(
    ...args: DropFirst<Parameters<typeof notInside>>
  ): StringRuleInstance;
  isBlank(...args: DropFirst<Parameters<typeof isBlank>>): StringRuleInstance;
  isNotBlank(
    ...args: DropFirst<Parameters<typeof isNotBlank>>
  ): StringRuleInstance;
  minLength(
    ...args: DropFirst<Parameters<typeof minLength>>
  ): StringRuleInstance;
  maxLength(
    ...args: DropFirst<Parameters<typeof maxLength>>
  ): StringRuleInstance;
  lengthEquals(
    ...args: DropFirst<Parameters<typeof lengthEquals>>
  ): StringRuleInstance;
  lengthNotEquals(
    ...args: DropFirst<Parameters<typeof lengthNotEquals>>
  ): StringRuleInstance;
  longerThan(
    ...args: DropFirst<Parameters<typeof longerThan>>
  ): StringRuleInstance;
  longerThanOrEquals(
    ...args: DropFirst<Parameters<typeof longerThanOrEquals>>
  ): StringRuleInstance;
  shorterThan(
    ...args: DropFirst<Parameters<typeof shorterThan>>
  ): StringRuleInstance;
  shorterThanOrEquals(
    ...args: DropFirst<Parameters<typeof shorterThanOrEquals>>
  ): StringRuleInstance;
}
