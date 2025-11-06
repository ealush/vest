import * as compoundRules from 'compoundRules';
import { ctx } from 'enforceContext';
import { isArray } from 'isArray';
import * as schemaRules from 'schemaRules';
import type { DropFirst } from 'vest-utils';

import type { ArrayRuleInstance } from 'arrayRules';
import * as arrayRules from 'arrayRules';
import { isBoolean, type BooleanRuleInstance } from 'booleanRules';
import * as booleanRules from 'booleanRules';
import type { RuleInstance } from 'enforceUtil';
import { addToChain } from 'genRuleChain';
import { AnyRuleInstance } from 'generalRules';
import * as generalRules from 'generalRules';
import {
  isNull,
  isUndefined,
  isNullish,
  type NullRuleInstance,
  type UndefinedRuleInstance,
  type NullishRuleInstance,
} from 'nullishRules';
import { isNumber, type NumberRuleInstance } from 'numberRules';
import * as numberRules from 'numberRules';
import { isNumeric, type NumericRuleInstance } from 'numericRules';
import * as numericRules from 'numericRules';
import { ObjectRuleInstance } from 'objectRules';
import * as objectRules from 'objectRules';
import { isString, type StringRuleInstance } from 'stringRules';
import * as stringRules from 'stringRules';
import type { FirstArg } from 'typeUtils';

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

function adaptDynamicRules<
  T extends RuleInstance<any, [any]>,
  O extends Record<string, (...args: any[]) => any>,
>(container: O): Record<keyof typeof container, (...args: any[]) => T> {
  return Object.keys(container).reduce(
    (acc, key) => {
      (acc as any)[key] = (...args: any[]) =>
        addToChain({}, (value: any) => {
          const result = ctx.run({ value }, () =>
            (container as any)[key](value, ...args),
          );
          // If result has a .pass property, it's a RuleRunReturn, otherwise it's a boolean
          return typeof result === 'object' &&
            result !== null &&
            'pass' in result
            ? result.pass
            : result;
        });
      return acc;
    },
    {} as Record<keyof typeof container, (...args: any[]) => T>,
  );
}

const { partial: _partial, ...schemaRulesWithoutPartial } = schemaRules;

const baseEnforceLazy = {
  // Schema and compound rules need to be adapted to lazy API
  ...adaptDynamicRules<RuleInstance<any, [any]>, typeof compoundRules>(
    compoundRules,
  ),
  // partial is excluded as it's a schema transformer, not a validator
  ...adaptDynamicRules<
    RuleInstance<any, [any]>,
    typeof schemaRulesWithoutPartial
  >(schemaRulesWithoutPartial),
  ...adaptDynamicRules<AnyRuleInstance, typeof generalRules>(generalRules),
  ...adaptDynamicRules<ObjectRuleInstance, typeof objectRules>(objectRules),
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

export const enforceLazy = baseEnforceLazy as TCustomLazyRules &
  typeof baseEnforceLazy;
