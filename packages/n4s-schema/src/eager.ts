import {
  assign,
  dynamicValue,
  invariant,
  isNullish,
  StringObject,
} from 'vest-utils';
import type { DropFirst, Maybe, Stringable } from 'vest-utils';

import * as arrayRules from 'arrayRules';
import * as booleanRules from 'booleanRules';
import * as commonComparison from 'commonComparison';
import * as commonContainer from 'commonContainer';
import * as commonLength from 'commonLength';
import { RuleRunReturn } from 'enforceUtil';
import * as generalRules from 'generalRules';
import * as nullishRules from 'nullishRules';
import * as numberRules from 'numberRules';
import * as numericRules from 'numericRules';
import * as objectRules from 'objectRules';
import * as stringRules from 'stringRules';

const message = 'message';

function isMessageKey<T>(key: keyof EnforceBase<T>): boolean {
  return key === message;
}

// eslint-disable-next-line max-lines-per-function
// storage for user-extended custom rules (value-first signature)
const customRules: Record<string, (...args: any[]) => any> = {};

export function extendEager(rules: Record<string, (...args: any[]) => any>) {
  assign(customRules, rules);
}

export function enforceEager<T>(value: T): EnforceEagerReturn<T> {
  let customMessage: Maybe<string> = undefined;

  const proxy = new Proxy(
    {},
    {
      get(target: any, key: string) {
        // Handle special .message() method
        if (isMessageKey<T>(key as keyof EnforceBase<T>)) {
          return setMessage;
        }

        // On property access, we identify if it is a rule or not.
        const rule = getRule(key);

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
  function genRuleCall(target: any, rule: UnmodifiedRules, ruleName: string) {
    return function ruleCall(...args: Args): any {
      // Order of operation:
      // 1. Create a context with the value being enforced
      // 2. Call the rule within the context, and pass over the arguments passed to it
      // 3. Transform the result to the correct output format
      const transformedResult = transformResult(
        (rule as (...args: any[]) => any)(value, ...args),
        ruleName,
        value,
        ...args,
      );

      // On rule failure (the result is false), we either throw an error
      // or throw a string value if the rule has a message defined in it.
      invariant(
        transformedResult.pass,
        enforceMessage(ruleName, transformedResult, value, customMessage),
      );

      // Reset the custom message after rule execution
      setMessage(undefined);

      // This is not really needed because it will always be true
      // As we're throwing an error on failure
      // but it is here so that users have a sense of what is happening
      // when they try to log the result of enforce and not just see a proxy object
      target.pass = transformedResult.pass;

      return target;
    };
  }
}

// add the missing parameters to enforceMessage
function enforceMessage(
  ruleName: string,
  transformedResult: RuleDetailedResult,
  value: RuleValue,
  customMessage?: string,
) {
  if (!isNullish(customMessage)) return StringObject(customMessage);
  if (isNullish(transformedResult.message)) {
    return `enforce/${ruleName} failed with ${JSON.stringify(value)}`;
  }
  return StringObject(transformedResult.message);
}
type RuleValue = unknown;
type Args = any[];
type RuleDetailedResult = { pass: boolean; message?: Stringable };

/**
 * Transform the result of a rule into a standard format
 */
function transformResult(
  result: any,
  ruleName: string,
  value: RuleValue,
  ...args: Args
): RuleDetailedResult {
  validateResult(result);

  // if result is boolean
  if (booleanRules.isBoolean(result)) {
    return { pass: result };
  }
  return {
    pass: !!result.pass,
    message: dynamicValue(result.message, ruleName, value, ...args),
  };
}

function validateResult<T>(result: RuleRunReturn<T>): void {
  // if result is boolean, or if result.pass is boolean
  invariant(
    booleanRules.isBoolean(result) ||
      (result && booleanRules.isBoolean(result.pass)),
    'Incorrect return value for rule: ' + JSON.stringify(result),
  );
}

// Eager wrappers for object membership (value-first)
const objectEager = {
  isKeyOf: (value: string | number | symbol, obj: object) =>
    objectRules.isKeyOf(obj)(value),
  isNotKeyOf: (value: string | number | symbol, obj: object) =>
    objectRules.isNotKeyOf(obj)(value),
  isValueOf: (value: unknown, obj: Record<string, unknown>) =>
    objectRules.isValueOf(obj)(value),
  isNotValueOf: (value: unknown, obj: Record<string, unknown>) =>
    objectRules.isNotValueOf(obj)(value),
};

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
  ...objectEager,
  ...stringRules,
};

function getRule(ruleName: string): UnmodifiedRules | null {
  // Prefer user-defined rules when present
  return (
    (customRules[ruleName] as UnmodifiedRules | undefined) ??
    allRules[ruleName as UnmodifiedRuleKeys]
  );
}

type UnmodifiedRuleKeys = keyof typeof allRules;
type UnmodifiedRules = (typeof allRules)[UnmodifiedRuleKeys];

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
  RuleName extends GuardRuleNames
    ? any
    : RuleName extends NumericComparisonNames
      ? number | string
      : RuleName extends LengthRuleNames
        ? string | any[]
        : RuleName extends ArrayRuleNames
          ? any[]
          : RuleName extends NumberRuleNames
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

// Helper to extract first argument of a function
type FirstArg<F> = F extends (arg: infer A, ...rest: any[]) => any ? A : never;
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

type EnforceBase<T = any> = TModifiers<T> & TRules<T> & TCustomRules<T>;

type EnforceEagerReturn<T = any> = EnforceBase<T> & {
  pass: boolean;
};
