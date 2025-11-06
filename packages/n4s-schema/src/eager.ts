import * as compoundRules from 'compoundRules';
import { ctx } from 'enforceContext';
import type { MultiTypeInput } from 'isArrayOf';
import type { LooseShapeValue } from 'loose';
import type { PartialShapeValue } from 'partial';
import * as schemaRules from 'schemaRules';
import type { ShapeValue } from 'shape';
import { assign, invariant } from 'vest-utils';
import type { DropFirst, Maybe } from 'vest-utils';

import * as arrayRules from 'arrayRules';
import * as booleanRules from 'booleanRules';
import * as commonComparison from 'commonComparison';
import * as commonContainer from 'commonContainer';
import * as commonLength from 'commonLength';
import type { RuleInstance } from 'enforceUtil';
import * as generalRules from 'generalRules';
import * as nullishRules from 'nullishRules';
import * as numberRules from 'numberRules';
import * as numericRules from 'numericRules';
import * as objectRules from 'objectRules';
import { enforceMessage, transformResult } from 'ruleResult';
import * as stringRules from 'stringRules';
import type { FirstArg } from 'typeUtils';

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

  const proxy = new Proxy(
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

// Get all rule names from each module
type NumberRuleNames = keyof typeof numberRules;
type StringRuleNames = keyof typeof stringRules;
type ArrayRuleNames = keyof typeof arrayRules;
type BooleanRuleNames = keyof typeof booleanRules;
type NumericRuleNames = keyof typeof numericRules;
type LengthRuleNames = keyof typeof commonLength;
// Numeric comparisons from commonComparison that require number|string
type NumericComparisonNames =
  | 'greaterThan'
  | 'greaterThanOrEquals'
  | 'lessThan'
  | 'lessThanOrEquals';
// Guard rules allowed on any input type
type GuardRuleNames =
  | 'isNumber'
  | 'isString'
  | 'isBoolean'
  | 'isArray'
  | 'isNumeric';

// Map rule name to required input type
type RuleRequiresType<RuleName extends keyof typeof allRules> =
  // Universally applicable comparisons
  RuleName extends 'equals' | 'notEquals'
    ? any
    : // Pattern matching works on numbers (coerced) and strings
      RuleName extends 'matches' | 'notMatches'
      ? number | string
      : // Container membership works on strings and arrays
        RuleName extends 'inside' | 'notInside'
        ? string | any[]
        : // Emptiness checks are broadly applicable (strings, arrays, objects, nullish handling)
          RuleName extends 'isEmpty' | 'isNotEmpty'
          ? any
          : // NaN checks applicable to numeric-like inputs
            RuleName extends 'isNaN' | 'isNotNaN'
            ? number | string
            : // Built-in guards always available
              RuleName extends GuardRuleNames
              ? any
              : // Numeric comparisons allow number|string
                RuleName extends NumericComparisonNames
                ? number | string
                : // Length-based rules on strings and arrays
                  RuleName extends LengthRuleNames
                  ? string | any[]
                  : // Array-only rules
                    RuleName extends ArrayRuleNames
                    ? any[]
                    : // Type-specific rule groups
                      RuleName extends NumberRuleNames
                      ? number
                      : RuleName extends StringRuleNames
                        ? string
                        : RuleName extends BooleanRuleNames
                          ? boolean
                          : RuleName extends NumericRuleNames
                            ? number | string
                            : any;

// Map rule name to output type after execution
type RuleReturnsType<
  T,
  RuleName extends keyof typeof allRules,
> = RuleName extends NumberRuleNames
  ? number
  : RuleName extends StringRuleNames
    ? string
    : RuleName extends BooleanRuleNames
      ? boolean
      : RuleName extends NumericRuleNames
        ? number | string
        : RuleName extends ArrayRuleNames
          ? T extends any[]
            ? T
            : any[]
          : T;

// Check if value type is compatible with rule
type AcceptsValue<T, RuleName extends keyof typeof allRules> =
  T extends RuleRequiresType<RuleName> ? true : never;

// Generate typed rule methods
type TRules<T> = {
  [K in keyof typeof allRules as (typeof allRules)[K] extends (
    ...args: any
  ) => any
    ? AcceptsValue<T, K> extends never
      ? never
      : K
    : never]: (
    ...args: DropFirst<
      Parameters<Extract<(typeof allRules)[K], (...args: any) => any>>
    >
  ) => EnforceEagerReturn<RuleReturnsType<T, K>>;
};

type TModifiers<T> = {
  message: (input: string) => EnforceEagerReturn<T>;
};

// Map custom rules (value-first) to their eager signatures by dropping the value
type TCustomRules<T> = {
  [K in keyof n4s.ValueFirstRules as T extends FirstArg<n4s.ValueFirstRules[K]>
    ? K
    : never]: (
    ...args: DropFirst<
      Parameters<Extract<n4s.ValueFirstRules[K], (...args: any) => any>>
    >
  ) => EnforceEagerReturn<T>;
};

// Schema rules for object validation
// Aliases for eager schema rule return typing to centralize shape forms.
type ShapeResult<S extends Record<string, RuleInstance<any>>> =
  EnforceEagerReturn<ShapeValue<S>>;
type LooseResult<S extends Record<string, RuleInstance<any>>> =
  EnforceEagerReturn<LooseShapeValue<S>>;
type PartialResult<S extends Record<string, RuleInstance<any>>> =
  EnforceEagerReturn<PartialShapeValue<S>>;

type TSchemaRules<T> =
  T extends Record<string, any>
    ? {
        shape<S extends Record<string, RuleInstance<any>>>(
          schema: S,
        ): ShapeResult<S>;
        loose<S extends Record<string, RuleInstance<any>>>(
          schema: S,
        ): LooseResult<S>;
        partial<S extends Record<string, RuleInstance<any>>>(
          schema: S,
        ): PartialResult<S>;
      }
    : Record<string, never>;

// Schema rules for array validation
type TArraySchemaRules<T> = T extends any[]
  ? {
      isArrayOf<R extends RuleInstance<any, any>[]>(
        ...rules: R
      ): EnforceEagerReturn<MultiTypeInput<R>[]>;
    }
  : Record<string, never>;

type EnforceBase<T = any> = TModifiers<T> &
  TRules<T> &
  TCustomRules<T> &
  TSchemaRules<T> &
  TArraySchemaRules<T>;

type EnforceEagerReturn<T = any> = EnforceBase<T> & {
  pass: boolean;
};
