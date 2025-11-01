import { isArray, arrayRules, type ArrayRuleInstance } from 'arrayRules';
import {
  isBoolean,
  booleanRules,
  type BooleanRuleInstance,
} from 'booleanRules';
import { addToChain } from 'genRuleChain';
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
  type TruthyRuleInstance,
  type FalsyRuleInstance,
  type EmptyRuleInstance,
  type NotEmptyRuleInstance,
  type NaNRuleInstance,
  type NotNaNRuleInstance,
  type ConditionRuleInstance,
  type NotArrayRuleInstance,
  type NotBooleanRuleInstance,
  type NotNumberRuleInstance,
  type NotStringRuleInstance,
  type NotNumericRuleInstance,
} from 'generalRules';
import {
  isNull,
  isNotNull,
  isUndefined,
  isNotUndefined,
  isNullish,
  isNotNullish,
  type NullRuleInstance,
  type NotNullRuleInstance,
  type UndefinedRuleInstance,
  type NotUndefinedRuleInstance,
  type NullishRuleInstance,
  type NotNullishRuleInstance,
} from 'nullishRules';
import { isNumber, numberRules, type NumberRuleInstance } from 'numberRules';
import {
  isNumeric,
  numericRules,
  type NumericRuleInstance,
} from 'numericRules';
import {
  checkKey,
  checkValue,
  keyRules,
  valueRules,
  type ObjectRuleInstance,
  type ValueRuleInstance,
} from 'objectRules';
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
} from 'schemaRules';
import { isString, stringRules, type StringRuleInstance } from 'stringRules';

export const enforceLazy = {
  allOf,
  anyOf,
  checkKey: (): ObjectRuleInstance => addToChain(keyRules, checkKey),
  checkValue: <T = any>(): ValueRuleInstance<T> =>
    addToChain(valueRules as any, checkValue),
  condition: (cond: boolean): ConditionRuleInstance =>
    addToChain({}, () => condition(cond)),
  isArray: <T = any>(): ArrayRuleInstance<T> =>
    addToChain(arrayRules as any, isArray),
  isArrayOf,
  isBoolean: (): BooleanRuleInstance => addToChain(booleanRules, isBoolean),
  isEmpty: (): EmptyRuleInstance => addToChain({}, isEmpty),
  isFalsy: (): FalsyRuleInstance => addToChain({}, isFalsy),
  isNaN: (): NaNRuleInstance => addToChain({}, isNaN),
  isNotArray: (): NotArrayRuleInstance => addToChain({}, isNotArray),
  isNotBoolean: (): NotBooleanRuleInstance => addToChain({}, isNotBoolean),
  isNotEmpty: (): NotEmptyRuleInstance => addToChain({}, isNotEmpty),
  isNotNaN: (): NotNaNRuleInstance => addToChain({}, isNotNaN),
  isNotNull: (): NotNullRuleInstance => addToChain({}, isNotNull),
  isNotNullish: (): NotNullishRuleInstance => addToChain({}, isNotNullish),
  isNotNumber: (): NotNumberRuleInstance => addToChain({}, isNotNumber),
  isNotNumeric: (): NotNumericRuleInstance => addToChain({}, isNotNumeric),
  isNotString: (): NotStringRuleInstance => addToChain({}, isNotString),
  isNotUndefined: (): NotUndefinedRuleInstance =>
    addToChain({}, isNotUndefined),
  isNull: (): NullRuleInstance => addToChain({}, isNull),
  isNullish: (): NullishRuleInstance => addToChain({}, isNullish),
  isNumber: (): NumberRuleInstance => addToChain(numberRules, isNumber),
  isNumeric: (): NumericRuleInstance => addToChain(numericRules, isNumeric),
  isString: (): StringRuleInstance => addToChain(stringRules, isString),
  isTruthy: (): TruthyRuleInstance => addToChain({}, isTruthy),
  isUndefined: (): UndefinedRuleInstance => addToChain({}, isUndefined),
  loose,
  noneOf,
  oneOf,
  optional,
  partial,
  shape,
};
