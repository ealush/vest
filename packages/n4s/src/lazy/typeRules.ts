import type { ArrayRuleInstance } from '../rules/arrayRules';
import * as arrayRules from '../rules/arrayRules';
import { isBoolean, type BooleanRuleInstance } from '../rules/booleanRules';
import * as booleanRules from '../rules/booleanRules';
import { addToChain } from '../rules/genRuleChain';
import { isArray } from '../rules/array/isArrayRule';
import { isNumeric } from '../rules/numeric/isNumeric';
import {
  isNull,
  isUndefined,
  isNullish,
  type NullRuleInstance,
  type UndefinedRuleInstance,
  type NullishRuleInstance,
} from '../rules/nullishRules';
import {
  isNumber,
  type NumberRuleInstance,
  type NumericRuleInstance,
} from '../rules/numberRules';
import * as numberRules from '../rules/numberRules';
import * as numericRules from '../rules/numberRules';
import { isString, type StringRuleInstance } from '../rules/stringRules';
import * as stringRules from '../rules/stringRules';

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
