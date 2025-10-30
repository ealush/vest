/**
 * Re-exports of all rules from categorical files.
 * This file serves as a central export point for backward compatibility.
 * All rule implementations are now organized by category.
 */

// String rules
export { isString } from './rules/stringRules';

// Number rules
export { isNumber } from './rules/numberRules';

// Numeric rules (accepts numbers or numeric strings)
export { isNumeric } from './rules/numericRules';

// Boolean rules
export { isBoolean } from './rules/booleanRules';

// Array rules
export { isArray } from './rules/arrayRules';

// Nullish rules
export {
  isNull,
  isNotNull,
  isUndefined,
  isNotUndefined,
  isNullish,
  isNotNullish,
} from './rules/nullishRules';

// Object rules
export { checkKey, checkValue } from './rules/objectRules';

// General rules
export {
  isTruthy,
  isFalsy,
  isEmpty,
  isNotEmpty,
  isBlank,
  isNotBlank,
  isNaN,
  isNotNaN,
  condition,
  isNotArray,
  isNotBoolean,
  isNotNumber,
  isNotString,
  isNotNumeric,
} from './rules/generalRules';
