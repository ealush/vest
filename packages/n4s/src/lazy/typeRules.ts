import { isArray } from '../rules/array/isArrayRule';
import {
  BuildRuleInstance,
  ExtractRuleFunctions,
} from '../rules/RuleInstanceBuilder';
import * as arrayRules from '../rules/arrayRules';
import { isBoolean, type BooleanRuleInstance } from '../rules/booleanRules';
import * as booleanRules from '../rules/booleanRules';
import { addToChain } from '../rules/genRuleChain';
import {
  isNull,
  isUndefined,
  isNullish,
  type NullRuleInstance,
  type UndefinedRuleInstance,
  type NullishRuleInstance,
} from '../rules/nullishRules';
import { isNumber } from '../rules/numberRules';
import * as numberRules from '../rules/numberRules';
import { isNumeric } from '../rules/numeric/isNumeric';
import { arrayParsers } from '../rules/parsers/arrayParsers';
import { generalParsers } from '../rules/parsers/generalParsers';
import { numberParsers } from '../rules/parsers/numberParsers';
import { stringParsers } from '../rules/parsers/stringParsers';
import { registerParserRules } from '../rules/parsers/parserUtils';
import { isString } from '../rules/stringRules';
import * as stringRules from '../rules/stringRules';

registerParserRules({ toNumber: numberRules.toNumber });

const lazyArrayRules = {
  ...arrayRules,
  ...arrayParsers,
  ...generalParsers,
} as const;

const lazyNumberRules = {
  ...numberRules,
  ...numberParsers,
  ...generalParsers,
} as const;

const lazyStringRules = {
  ...stringRules,
  ...stringParsers,
  ...generalParsers,
} as const;

type LazyArrayRuleInstance<T = any> = BuildRuleInstance<
  T[],
  [T[]],
  ExtractRuleFunctions<typeof lazyArrayRules>
>;

type LazyNumberRuleInstance = BuildRuleInstance<
  number,
  [number],
  ExtractRuleFunctions<typeof lazyNumberRules>
>;

type LazyNumericRuleInstance = BuildRuleInstance<
  string | number,
  [string | number],
  ExtractRuleFunctions<typeof lazyNumberRules>
>;

type LazyStringRuleInstance = BuildRuleInstance<
  string,
  [string],
  ExtractRuleFunctions<typeof lazyStringRules>
>;

export const typeRules = {
  isArray: <T = any>(): LazyArrayRuleInstance<T> =>
    addToChain<LazyArrayRuleInstance<T>>(lazyArrayRules, isArray),
  isBoolean: (): BooleanRuleInstance => addToChain(booleanRules, isBoolean),
  isNull: (): NullRuleInstance => addToChain({}, isNull),
  isNullish: (): NullishRuleInstance => addToChain({}, isNullish),
  isNumber: (): LazyNumberRuleInstance =>
    addToChain<LazyNumberRuleInstance>(lazyNumberRules, isNumber),
  isNumeric: (): LazyNumericRuleInstance =>
    addToChain<LazyNumericRuleInstance>(lazyNumberRules, isNumeric),
  isString: (): LazyStringRuleInstance =>
    addToChain<LazyStringRuleInstance>(lazyStringRules, isString),
  isUndefined: (): UndefinedRuleInstance => addToChain({}, isUndefined),
};
