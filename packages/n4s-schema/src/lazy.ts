import { isArray } from './rules/arrayRules';
import { isBoolean } from './rules/booleanRules';
import {
  isTruthy,
  isFalsy,
  isEmpty,
  isNotEmpty,
  isNaN,
  isNotNaN,
  condition,
  isNotArray,
  isNotBoolean,
  isNotNumber,
  isNotString,
  isNotNumeric,
} from './rules/generalRules';
import {
  isNull,
  isNotNull,
  isUndefined,
  isNotUndefined,
  isNullish,
  isNotNullish,
} from './rules/nullishRules';
import { isNumber } from './rules/numberRules';
import { isNumeric } from './rules/numericRules';
import { checkKey, checkValue } from './rules/objectRules';
import { isString } from './rules/stringRules';

export const enforceLazy = {
  isString,
  isNumber,
  isNumeric,
  isBoolean,
  isArray,
  isNull,
  isNotNull,
  isUndefined,
  isNotUndefined,
  isNullish,
  isNotNullish,
  checkKey,
  checkValue,
  isTruthy,
  isFalsy,
  isEmpty,
  isNotEmpty,
  isNaN,
  isNotNaN,
  condition,
  isNotArray,
  isNotBoolean,
  isNotNumber,
  isNotString,
  isNotNumeric,
};
