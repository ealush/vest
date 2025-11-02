import { isArray, type ArrayRuleInstance } from 'arrayRules';
import * as arrayRules from 'arrayRules';
import { isBoolean, type BooleanRuleInstance } from 'booleanRules';
import * as booleanRules from 'booleanRules';
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
import { isNumber, type NumberRuleInstance } from 'numberRules';
import * as numberRules from 'numberRules';
import { isNumeric, type NumericRuleInstance } from 'numericRules';
import * as numericRules from 'numericRules';
import * as schemaRules from 'schemaRules';
import { isString, type StringRuleInstance } from 'stringRules';
import * as stringRules from 'stringRules';

export const enforceLazy = {
  ...schemaRules,
  condition: (cond: boolean): ConditionRuleInstance =>
    addToChain({}, () => condition(cond)),
  isArray: <T = any>(): ArrayRuleInstance<T> =>
    addToChain(arrayRules as any, isArray),
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
};
