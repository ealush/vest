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
  isNotNaN,
  condition,
  isNotArray,
  isNotBoolean,
  isNotNumber,
  isNotString,
  isNotNumeric,
  type ConditionRuleInstance,
  AnyRuleInstance,
} from 'generalRules';
import {
  isNull,
  isNotNull,
  isUndefined,
  isNotUndefined,
  isNullish,
  isNotNullish,
  type NullRuleInstance,
  type UndefinedRuleInstance,
  type NullishRuleInstance,
} from 'nullishRules';
import { isNumber, type NumberRuleInstance } from 'numberRules';
import * as numberRules from 'numberRules';
import { isNumeric, type NumericRuleInstance } from 'numericRules';
import * as numericRules from 'numericRules';
import {
  isKeyOf,
  isNotKeyOf,
  isValueOf,
  isNotValueOf,
  ObjectRuleInstance,
} from 'objectRules';
import * as objectRules from 'objectRules';
import * as schemaRules from 'schemaRules';
import { isString, type StringRuleInstance } from 'stringRules';
import * as stringRules from 'stringRules';

export const enforceLazy = {
  ...schemaRules,
  condition: (cond: boolean): ConditionRuleInstance =>
    addToChain({}, () => condition(cond)),
  isArray: (): ArrayRuleInstance => addToChain(arrayRules, isArray),
  isBoolean: (): BooleanRuleInstance => addToChain(booleanRules, isBoolean),
  isNumber: (): NumberRuleInstance => addToChain(numberRules, isNumber),
  isNumeric: (): NumericRuleInstance => addToChain(numericRules, isNumeric),
  isValueOf: (obj: object): ObjectRuleInstance =>
    addToChain(objectRules, isValueOf(obj)),
  isKeyOf: (obj: object): ObjectRuleInstance =>
    addToChain(objectRules, isKeyOf(obj)),
  isNotKeyOf: (obj: object): ObjectRuleInstance =>
    addToChain(objectRules, isNotKeyOf(obj)),
  isNotValueOf: (obj: object): ObjectRuleInstance =>
    addToChain(objectRules, isNotValueOf(obj)),
  isString: (): StringRuleInstance => addToChain(stringRules, isString),
  isEmpty: (): AnyRuleInstance => addToChain({}, isEmpty),
  isFalsy: (): AnyRuleInstance => addToChain({}, isFalsy),
  isNotArray: (): AnyRuleInstance => addToChain({}, isNotArray),
  isNotBoolean: (): AnyRuleInstance => addToChain({}, isNotBoolean),
  isNotEmpty: (): AnyRuleInstance => addToChain({}, isNotEmpty),
  isNotNaN: (): AnyRuleInstance => addToChain({}, isNotNaN),
  isNotNull: (): AnyRuleInstance => addToChain({}, isNotNull),
  isNotNullish: (): AnyRuleInstance => addToChain({}, isNotNullish),
  isNotNumber: (): AnyRuleInstance => addToChain({}, isNotNumber),
  isNotNumeric: (): AnyRuleInstance => addToChain({}, isNotNumeric),
  isNotString: (): AnyRuleInstance => addToChain({}, isNotString),
  isNotUndefined: (): AnyRuleInstance => addToChain({}, isNotUndefined),
  isNull: (): NullRuleInstance => addToChain({}, isNull),
  isNullish: (): NullishRuleInstance => addToChain({}, isNullish),
  isTruthy: (): AnyRuleInstance => addToChain({}, isTruthy),
  isUndefined: (): UndefinedRuleInstance => addToChain({}, isUndefined),
};
