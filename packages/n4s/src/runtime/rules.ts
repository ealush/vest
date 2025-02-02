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

const comparisonRules = {
  equals,
  greaterThan,
  greaterThanOrEquals,
  gt: greaterThan,
  gte: greaterThanOrEquals,
  lessThan,
  lessThanOrEquals,
  lt: lessThan,
  lte: lessThanOrEquals,
  notEquals,
  numberEquals,
  numberNotEquals,
};

const typeCheckRules = {
  isArray,
  isBlank,
  isBoolean,
  isEmpty,
  isNaN,
  isNotArray,
  isNotBlank,
  isNotBoolean,
  isNotEmpty,
  isNotNaN,
  isNotNull,
  isNotNullish,
  isNotNumber,
  isNotNumeric,
  isNotString,
  isNotUndefined,
  isNull,
  isNullish,
  isNumber,
  isNumeric,
  isString,
  isUndefined,
};

const stringRules = {
  doesNotEndWith,
  doesNotStartWith,
  endsWith,
  matches,
  notMatches,
  startsWith,
};

const sizeRules = {
  lengthEquals,
  lengthNotEquals,
  longerThan,
  longerThanOrEquals,
  shorterThan,
  shorterThanOrEquals,
};

const miscRules = {
  condition,
  inside,
  isBetween,
  isEven,
  isFalsy,
  isKeyOf,
  isNegative,
  isNotBetween,
  isNotKeyOf,
  isNotValueOf,
  isOdd,
  isPositive,
  isTruthy,
  isValueOf,
  notInside,
};

export default function rules() {
  return {
    ...comparisonRules,
    ...typeCheckRules,
    ...sizeRules,
    ...stringRules,
    ...miscRules,
  };
}
