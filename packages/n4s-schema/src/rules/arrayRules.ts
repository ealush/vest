import { longerThanOrEquals } from 'longerThanOrEquals';
import { shorterThan } from 'shorterThan';
import { shorterThanOrEquals } from 'shorterThanOrEquals';
import { type DropFirst } from 'vest-utils';
import { isEmpty, isNotEmpty } from 'vest-utils';

import { RuleInstance } from 'RuleInstance';
import { equals, notEquals } from 'commonComparison';
import { inside, notInside } from 'commonContainer';
import { includes } from 'includes';
import { isArray } from 'isArrayRule';
import { isNotArray } from 'isNotArray';
import { lengthEquals } from 'lengthEquals';
import { lengthNotEquals } from 'lengthNotEquals';
import { longerThan } from 'longerThan';
import { maxLength } from 'maxLength';
import { minLength } from 'minLength';

export {
  longerThanOrEquals,
  shorterThan,
  shorterThanOrEquals,
  isEmpty,
  isNotEmpty,
  equals,
  notEquals,
  inside,
  notInside,
  includes,
  lengthEquals,
  lengthNotEquals,
  longerThan,
  maxLength,
  minLength,
  isArray,
  isNotArray,
};

export interface ArrayRuleInstance<T = any> extends RuleInstance<T[], [T[]]> {
  equals(...args: DropFirst<Parameters<typeof equals>>): ArrayRuleInstance<T>;
  notEquals(
    ...args: DropFirst<Parameters<typeof notEquals>>
  ): ArrayRuleInstance<T>;
  minLength(
    ...args: DropFirst<Parameters<typeof minLength>>
  ): ArrayRuleInstance<T>;
  maxLength(
    ...args: DropFirst<Parameters<typeof maxLength>>
  ): ArrayRuleInstance<T>;
  lengthEquals(
    ...args: DropFirst<Parameters<typeof lengthEquals>>
  ): ArrayRuleInstance<T>;
  lengthNotEquals(
    ...args: DropFirst<Parameters<typeof lengthNotEquals>>
  ): ArrayRuleInstance<T>;
  longerThan(
    ...args: DropFirst<Parameters<typeof longerThan>>
  ): ArrayRuleInstance<T>;
  longerThanOrEquals(
    ...args: DropFirst<Parameters<typeof longerThanOrEquals>>
  ): ArrayRuleInstance<T>;
  shorterThan(
    ...args: DropFirst<Parameters<typeof shorterThan>>
  ): ArrayRuleInstance<T>;
  shorterThanOrEquals(
    ...args: DropFirst<Parameters<typeof shorterThanOrEquals>>
  ): ArrayRuleInstance<T>;
  includes(
    ...args: DropFirst<Parameters<typeof includes>>
  ): ArrayRuleInstance<T>;
  inside(...args: DropFirst<Parameters<typeof inside>>): ArrayRuleInstance<T>;
  notInside(
    ...args: DropFirst<Parameters<typeof notInside>>
  ): ArrayRuleInstance<T>;
  isEmpty(...args: DropFirst<Parameters<typeof isEmpty>>): ArrayRuleInstance<T>;
  isNotEmpty(
    ...args: DropFirst<Parameters<typeof isNotEmpty>>
  ): ArrayRuleInstance<T>;
}
