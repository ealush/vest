import {
  greaterThan,
  isNull,
  isNotNull,
  isNullish,
  isNotNullish,
  isNumeric,
  isNotNumeric,
  isUndefined,
  isNotUndefined,
  lengthEquals,
  lengthNotEquals,
  longerThan,
  numberEquals,
  numberNotEquals,
  isArray,
  isNotArray,
  isPositive,
  isEmpty,
  isNotEmpty,
} from 'vest-utils';

import { endsWith, doesNotEndWith } from '@/rules/endsWith';
import { equals, notEquals } from '@/rules/equals';
import { greaterThanOrEquals } from '@/rules/greaterThanOrEquals';
import { inside, notInside } from '@/rules/inside';
import { isBetween, isNotBetween } from '@/rules/isBetween';
import { isBlank, isNotBlank } from '@/rules/isBlank';
import { isBoolean, isNotBoolean } from '@/rules/isBoolean';
import { isEven } from '@/rules/isEven';
import { isKeyOf, isNotKeyOf } from '@/rules/isKeyOf';
import { isNaN, isNotNaN } from '@/rules/isNaN';
import { isNegative } from '@/rules/isNegative';
import { isNumber, isNotNumber } from '@/rules/isNumber';
import { isOdd } from '@/rules/isOdd';
import { isString, isNotString } from '@/rules/isString';
import { isTruthy, isFalsy } from '@/rules/isTruthy';
import { isValueOf, isNotValueOf } from '@/rules/isValueOf';
import { lessThan } from '@/rules/lessThan';
import { lessThanOrEquals } from '@/rules/lessThanOrEquals';
import { longerThanOrEquals } from '@/rules/longerThanOrEquals';
import { matches, notMatches } from '@/rules/matches';
import { condition } from '@/rules/ruleCondition';
import { shorterThan } from '@/rules/shorterThan';
import { shorterThanOrEquals } from '@/rules/shorterThanOrEquals';
import { startsWith, doesNotStartWith } from '@/rules/startsWith';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, max-lines-per-function
export default function rules() {
  return {
    condition,
    doesNotEndWith,
    doesNotStartWith,
    endsWith,
    equals,
    greaterThan,
    greaterThanOrEquals,
    gt: greaterThan,
    gte: greaterThanOrEquals,
    inside,
    isArray,
    isBetween,
    isBlank,
    isBoolean,
    isEmpty,
    isEven,
    isFalsy,
    isKeyOf,
    isNaN,
    isNegative,
    isNotArray,
    isNotBetween,
    isNotBlank,
    isNotBoolean,
    isNotEmpty,
    isNotKeyOf,
    isNotNaN,
    isNotNull,
    isNotNullish,
    isNotNumber,
    isNotNumeric,
    isNotString,
    isNotUndefined,
    isNotValueOf,
    isNull,
    isNullish,
    isNumber,
    isNumeric,
    isOdd,
    isPositive,
    isString,
    isTruthy,
    isUndefined,
    isValueOf,
    lengthEquals,
    lengthNotEquals,
    lessThan,
    lessThanOrEquals,
    longerThan,
    longerThanOrEquals,
    lt: lessThan,
    lte: lessThanOrEquals,
    matches,
    notEquals,
    notInside,
    notMatches,
    numberEquals,
    numberNotEquals,
    shorterThan,
    shorterThanOrEquals,
    startsWith,
  };
}
