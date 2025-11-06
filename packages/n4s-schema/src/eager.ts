import type { RuleInstance } from 'RuleInstance';
import { ctx } from 'enforceContext';
import { assign, invariant } from 'vest-utils';
import type { Maybe } from 'vest-utils';

import * as arrayRules from 'arrayRules';
import * as booleanRules from 'booleanRules';
import * as commonComparison from 'commonComparison';
import * as commonContainer from 'commonContainer';
import * as commonLength from 'commonLength';
import * as compoundRules from 'compoundRules';
import * as generalRules from 'generalRules';
import { TCustomRules } from 'n4sTypes';
import * as nullishRules from 'nullishRules';
import * as numberRules from 'numberRules';
import * as numericRules from 'numericRules';
import * as objectRules from 'objectRules';
import { enforceMessage, transformResult } from 'ruleResult';
import * as schemaRules from 'schemaRules';
import { ArraySchemaResultMap } from 'schemaRulesTypes';
import * as stringRules from 'stringRules';

const messageKey = 'message';

// eslint-disable-next-line max-lines-per-function
// storage for user-extended custom rules (value-first signature)
const customRules: Record<string, (...args: any[]) => any> = {};

export function extendEager(rules: Record<string, (...args: any[]) => any>) {
  assign(customRules, rules);
}

// eslint-disable-next-line max-lines-per-function
export function enforceEager<T>(value: T): EnforceEagerReturn<T> {
  let customMessage: Maybe<string> = undefined;

  const proxy: EnforceEagerReturn<T> = new Proxy(
    {},
    {
      get(target: any, key: string) {
        // Handle special .message() method
        if ((key as string) === messageKey) {
          return setMessage;
        }

        // On property access, we identify if it is a rule or not.
        const rule = getRule(key) ?? getSchemaRule(key);

        // If it is a rule, we wrap it with `genRuleCall` that adds the base enforce behavior
        if (rule) {
          return genRuleCall(proxy, rule, key);
        }
        return target[key];
      },
    },
  );

  return proxy as EnforceEagerReturn<T>;

  function setMessage(msg?: string) {
    customMessage = msg;
    return proxy;
  }

  function genRuleCall(
    target: any,
    rule: UnmodifiedRules | SchemaRules,
    ruleName: string,
  ) {
    return function ruleCall(...args: Args): any {
      // All rules are now value-first: call with value, then args
      const transformedResult = ctx.run({ value }, () =>
        transformResult(
          (rule as (...args: any[]) => any)(value, ...args),
          ruleName,
          value,
          ...args,
        ),
      );

      invariant(
        transformedResult.pass,
        enforceMessage(ruleName, transformedResult, value, customMessage),
      );

      setMessage(undefined);
      target.pass = transformedResult.pass;

      return target;
    };
  }
}

type Args = any[];

const allRules = {
  ...arrayRules,
  ...booleanRules,
  ...commonComparison,
  ...commonContainer,
  ...commonLength,
  ...generalRules,
  ...nullishRules,
  ...numberRules,
  ...numericRules,
  ...objectRules,
  ...stringRules,
} as const;

// Schema and compound rules that return RuleInstance objects
const schemaRulesMap = {
  ...compoundRules,
  ...schemaRules,
} as const;

function getSchemaRule(ruleName: string): SchemaRules | null {
  return schemaRulesMap[ruleName as SchemaRuleKeys] ?? null;
}

function getRule(ruleName: string): UnmodifiedRules | null {
  // Prefer user-defined rules when present
  return (
    (customRules[ruleName] as UnmodifiedRules | undefined) ??
    allRules[ruleName as UnmodifiedRuleKeys]
  );
}

type UnmodifiedRuleKeys = keyof typeof allRules;
type UnmodifiedRules = (typeof allRules)[UnmodifiedRuleKeys];
type SchemaRuleKeys = keyof typeof schemaRulesMap;
type SchemaRules = (typeof schemaRulesMap)[SchemaRuleKeys];

// Get all rule names from each module (kept for potential future use)
// Note: previously used for manual typing; inference now derives directly.

// Map rule name to required input type
// Utility type helpers to infer directly from function signatures
type AnyFn = (...args: any[]) => any;
type FirstParam<F extends AnyFn> = F extends (arg: infer A, ...rest: any) => any
  ? A
  : never;
type TailParams<F extends AnyFn> = F extends (arg: any, ...rest: infer R) => any
  ? R
  : never;

// Infer the next value type after rule application.
// Heuristics:
// 1. Type predicates narrow (value is Narrowed)
// 2. RuleInstance unwraps its inner value type
// 3. boolean/void returns keep original value (guards)
// 4. Otherwise if return type is assignable to current value, keep T; else use return type
type InferNextValue<T, F extends AnyFn> = F extends (
  arg: any,
  ...rest: any
) => arg is infer Narrowed
  ? Narrowed
  : ReturnType<F> extends RuleInstance<infer Inner>
    ? Inner
    : ReturnType<F> extends boolean | void
      ? T
      : ReturnType<F> extends T
        ? T
        : ReturnType<F>;

// Generate typed rule methods directly from implementation signatures.
// Filter out rules whose first parameter type is not compatible with T.
type TRules<T> = {
  [K in keyof typeof allRules as (typeof allRules)[K] extends (
    ...args: any
  ) => any
    ? T extends FirstParam<Extract<(typeof allRules)[K], AnyFn>>
      ? K
      : never
    : never]: (
    ...args: TailParams<Extract<(typeof allRules)[K], AnyFn>>
  ) => EnforceEagerReturn<
    InferNextValue<T, Extract<(typeof allRules)[K], AnyFn>>
  >;
};

type TModifiers<T> = {
  message: (input: string) => EnforceEagerReturn<T>;
};

// Build schema rule signatures generically from the result map, avoiding repetition.
// Schema rules inferred from implementation signatures (drop value param, unwrap RuleInstance)
type DropFirstFn<F> = F extends (arg: any, ...rest: infer R) => infer Ret
  ? (...args: R) => Ret
  : never;
type UnwrapRuleInstance<R> = R extends RuleInstance<infer V> ? V : R;

type TSchemaRules<T> =
  T extends Record<string, any>
    ? {
        [K in keyof typeof schemaRulesMap]: DropFirstFn<
          (typeof schemaRulesMap)[K]
        > extends (...args: infer A) => infer R
          ? (...args: A) => EnforceEagerReturn<UnwrapRuleInstance<R>>
          : never;
      }
    : Record<string, never>;

export type TArraySchemaRules<T> = T extends any[]
  ? {
      [K in keyof ArraySchemaResultMap<any>]: <
        S extends RuleInstance<any, any>[],
      >(
        ...rules: S
      ) => EnforceEagerReturn<ArraySchemaResultMap<S>[K]>;
    }
  : Record<string, never>;

type EnforceBase<T = any> = TModifiers<T> &
  TRules<T> &
  TCustomRules<T> &
  TSchemaRules<T> &
  TArraySchemaRules<T>;

export type EnforceEagerReturn<T = any> = EnforceBase<T> & {
  pass: boolean;
};
