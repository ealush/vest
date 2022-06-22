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

import { endsWith, doesNotEndWith } from 'endsWith';
import { equals, notEquals } from 'equals';
import { greaterThanOrEquals } from 'greaterThanOrEquals';
import { inside, notInside } from 'inside';
import { isBetween, isNotBetween } from 'isBetween';
import { isBlank, isNotBlank } from 'isBlank';
import { isBoolean, isNotBoolean } from 'isBoolean';
import { isEven } from 'isEven';
import { isKeyOf, isNotKeyOf } from 'isKeyOf';
import { isNaN, isNotNaN } from 'isNaN';
import { isNegative } from 'isNegative';
import { isNumber, isNotNumber } from 'isNumber';
import { isOdd } from 'isOdd';
import { isString, isNotString } from 'isString';
import { isTruthy, isFalsy } from 'isTruthy';
import { isValueOf, isNotValueOf } from 'isValueOf';
import { lessThan } from 'lessThan';
import { lessThanOrEquals } from 'lessThanOrEquals';
import { longerThanOrEquals } from 'longerThanOrEquals';
import { matches, notMatches } from 'matches';
import { condition } from 'ruleCondition';
import { shorterThan } from 'shorterThan';
import { shorterThanOrEquals } from 'shorterThanOrEquals';
import { startsWith, doesNotStartWith } from 'startsWith';

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
