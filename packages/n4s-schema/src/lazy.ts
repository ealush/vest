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
import {
  allOf,
  anyOf,
  isArrayOf,
  loose,
  noneOf,
  oneOf,
  optional,
  partial,
  shape,
} from './schemaRules';

export const enforceLazy = {
  // Schema combinators (sorted)
  allOf,
  anyOf,
  isArrayOf,
  loose,
  noneOf,
  oneOf,
  optional,
  partial,
  shape,
  // Rule factories (sorted)
  checkKey,
  checkValue,
  condition,
  isArray,
  isBoolean,
  isEmpty,
  isFalsy,
  isNaN,
  isNotArray,
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
  isTruthy,
  isUndefined,
};
