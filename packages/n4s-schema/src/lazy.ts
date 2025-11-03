import * as schemaRules from 'schemaRules';
import type { DropFirst } from 'vest-utils';

import { isArray, type ArrayRuleInstance } from 'arrayRules';
import * as arrayRules from 'arrayRules';
import { isBoolean, type BooleanRuleInstance } from 'booleanRules';
import * as booleanRules from 'booleanRules';
import type { RuleInstance } from 'enforceUtil';
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
import { isString, type StringRuleInstance } from 'stringRules';
import * as stringRules from 'stringRules';

// Helpers for deriving types from value-first custom rules
type FirstArg<F> = F extends (arg: infer A, ...rest: any[]) => any ? A : never;

// Map custom rules (value-first) to their lazy builder signatures
type TCustomLazyRules = {
  [K in keyof n4s.ValueFirstRules]: (
    ...args: DropFirst<
      Parameters<Extract<n4s.ValueFirstRules[K], (...args: any) => any>>
    >
  ) => RuleInstance<
    FirstArg<n4s.ValueFirstRules[K]>,
    [FirstArg<n4s.ValueFirstRules[K]>]
  >;
};

// Omit non-boolean helpers from numericRules when building chains
const { toNumber: _omitToNumber, ...numericRuleFns } = numericRules as any;

// Adapt object rules (curried by object-first) to value-first boolean predicates
const objectRuleFns = {
  isKeyOf: (value: string | number | symbol, obj: object) =>
    objectRules.isKeyOf(obj)(value),
  isNotKeyOf: (value: string | number | symbol, obj: object) =>
    objectRules.isNotKeyOf(obj)(value),
  isNotValueOf: (value: any, obj: Record<string, any>) =>
    objectRules.isNotValueOf(obj)(value),
  isValueOf: (value: any, obj: Record<string, any>) =>
    objectRules.isValueOf(obj)(value),
} as const;

const baseEnforceLazy = {
  ...schemaRules,
  condition: (cond: boolean): ConditionRuleInstance =>
    addToChain({}, () => condition(cond)),
  isArray: (): ArrayRuleInstance => addToChain(arrayRules, isArray),
  isBoolean: (): BooleanRuleInstance => addToChain(booleanRules, isBoolean),
  isEmpty: (): AnyRuleInstance => addToChain({}, isEmpty),
  isFalsy: (): AnyRuleInstance => addToChain({}, isFalsy),
  isKeyOf: (obj: object): ObjectRuleInstance =>
    addToChain(objectRuleFns, isKeyOf(obj)),
  isNotArray: (): AnyRuleInstance => addToChain({}, isNotArray),
  isNotBoolean: (): AnyRuleInstance => addToChain({}, isNotBoolean),
  isNotEmpty: (): AnyRuleInstance => addToChain({}, isNotEmpty),
  isNotKeyOf: (obj: object): ObjectRuleInstance =>
    addToChain(objectRuleFns, isNotKeyOf(obj)),
  isNotNaN: (): AnyRuleInstance => addToChain({}, isNotNaN),
  isNotNull: (): AnyRuleInstance => addToChain({}, isNotNull),
  isNotNullish: (): AnyRuleInstance => addToChain({}, isNotNullish),
  isNotNumber: (): AnyRuleInstance => addToChain({}, isNotNumber),
  isNotNumeric: (): AnyRuleInstance => addToChain({}, isNotNumeric),
  isNotString: (): AnyRuleInstance => addToChain({}, isNotString),
  isNotUndefined: (): AnyRuleInstance => addToChain({}, isNotUndefined),
  isNotValueOf: (obj: object): ObjectRuleInstance =>
    addToChain(objectRuleFns, isNotValueOf(obj)),
  isNull: (): NullRuleInstance => addToChain({}, isNull),
  isNullish: (): NullishRuleInstance => addToChain({}, isNullish),
  isNumber: (): NumberRuleInstance => addToChain(numberRules, isNumber),
  // numericRules also exports helpers like `toNumber` that are not boolean predicates,
  // so omit them when passing the rule map into addToChain.
  isNumeric: (): NumericRuleInstance =>
    addToChain(
      numericRuleFns as Record<string, (...args: any[]) => boolean>,
      isNumeric,
    ),
  isString: (): StringRuleInstance => addToChain(stringRules, isString),
  isTruthy: (): AnyRuleInstance => addToChain({}, isTruthy),
  isUndefined: (): UndefinedRuleInstance => addToChain({}, isUndefined),
  isValueOf: (obj: object): ObjectRuleInstance =>
    addToChain(objectRuleFns, isValueOf(obj)),
};

export const enforceLazy = baseEnforceLazy as TCustomLazyRules &
  typeof baseEnforceLazy;
