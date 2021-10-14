import { endsWith, doesNotEndWith } from 'endsWith';
import { equals, notEquals } from 'equals';
import { greaterThan } from 'greaterThan';
import { greaterThanOrEquals } from 'greaterThanOrEquals';
import { inside, notInside } from 'inside';
import { isArray, isNotArray } from 'isArrayValue';
import { isBetween, isNotBetween } from 'isBetween';
import { isBlank, isNotBlank } from 'isBlank';
import { isBoolean, isNotBoolean } from 'isBoolean';
import { isEmpty, isNotEmpty } from 'isEmpty';
import { isEven } from 'isEven';
import { isNaN, isNotNaN } from 'isNaN';
import { isPositive, isNegative } from 'isNegative';
import { isNull, isNotNull } from 'isNull';
import { isNumber, isNotNumber } from 'isNumber';
import { isNumeric, isNotNumeric } from 'isNumeric';
import { isOdd } from 'isOdd';
import { isString, isNotString } from 'isString';
import { isTruthy, isFalsy } from 'isTruthy';
import { isUndefined, isNotUndefined } from 'isUndefined';
import { lengthEquals, lengthNotEquals } from 'lengthEquals';
import { lessThan } from 'lessThan';
import { lessThanOrEquals } from 'lessThanOrEquals';
import { longerThan } from 'longerThan';
import { longerThanOrEquals } from 'longerThanOrEquals';
import { matches, notMatches } from 'matches';
import { numberEquals, numberNotEquals } from 'numberEquals';
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
    isNaN,
    isNegative,
    isNotArray,
    isNotBetween,
    isNotBlank,
    isNotBoolean,
    isNotEmpty,
    isNotNaN,
    isNotNull,
    isNotNumber,
    isNotNumeric,
    isNotString,
    isNotUndefined,
    isNull,
    isNumber,
    isNumeric,
    isOdd,
    isPositive,
    isString,
    isTruthy,
    isUndefined,
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
