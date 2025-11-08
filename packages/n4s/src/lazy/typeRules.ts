import type { ArrayRuleInstance } from 'arrayRules';
import * as arrayRules from 'arrayRules';
import { isBoolean, type BooleanRuleInstance } from 'booleanRules';
import * as booleanRules from 'booleanRules';
import { addToChain } from 'genRuleChain';
import { isArray } from 'isArrayRule';
import { isNumeric } from 'isNumeric';
import {
  isNull,
  isUndefined,
  isNullish,
  type NullRuleInstance,
  type UndefinedRuleInstance,
  type NullishRuleInstance,
} from 'nullishRules';
import {
  isNumber,
  type NumberRuleInstance,
  type NumericRuleInstance,
} from 'numberRules';
import * as numberRules from 'numberRules';
import * as numericRules from 'numberRules';
import { isString, type StringRuleInstance } from 'stringRules';
import * as stringRules from 'stringRules';

export const typeRules = {
  isArray: <T = any>(): ArrayRuleInstance<T> =>
    addToChain<ArrayRuleInstance<T>>(arrayRules as any, isArray),
  isBoolean: (): BooleanRuleInstance => addToChain(booleanRules, isBoolean),
  isNull: (): NullRuleInstance => addToChain({}, isNull),
  isNullish: (): NullishRuleInstance => addToChain({}, isNullish),
  isNumber: (): NumberRuleInstance => addToChain(numberRules, isNumber),
  isNumeric: (): NumericRuleInstance => addToChain(numericRules, isNumeric),
  isString: (): StringRuleInstance => addToChain(stringRules, isString),
  isUndefined: (): UndefinedRuleInstance => addToChain({}, isUndefined),
};
