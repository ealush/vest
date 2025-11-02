import { ruleRunReturn, RuleRunReturn } from 'enforce';
import { dynamicValue, invariant, isNullish, StringObject } from 'vest-utils';
import type { DropFirst, Maybe, Stringable } from 'vest-utils';

import * as arrayRules from 'arrayRules';
import * as booleanRules from 'booleanRules';
import * as commonComparison from 'commonComparison';
import * as commonContainer from 'commonContainer';
import * as commonLength from 'commonLength';
import * as generalRules from 'generalRules';
import * as nullishRules from 'nullishRules';
import * as numberRules from 'numberRules';
import * as numericRules from 'numericRules';
import * as objectRules from 'objectRules';
import * as stringRules from 'stringRules';

const message = 'message';

function isMessageKey(key: keyof EnforceBase): boolean {
  return key === message;
}

// eslint-disable-next-line max-lines-per-function
export function enforce(value: any): EnforceEagerReturn {
  let customMessage: Maybe<string> = undefined;

  const proxy = new Proxy(
    {},
    {
      get(target: any, key: keyof EnforceBase) {
        // Handle special .message() method
        if (isMessageKey(key)) {
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

  return proxy as EnforceEagerReturn;

  function setMessage(msg: string) {
    customMessage = msg;
    return proxy;
  }

  function genRuleCall(
    target: EnforceEagerReturn,
    rule: RuleBase,
    ruleName: string,
  ) {
    return function ruleCall(...args: Args): EnforceEagerReturn {
      // Order of operation:
      // 1. Create a context with the value being enforced
      // 2. Call the rule within the context, and pass over the arguments passed to it
      // 3. Transform the result to the correct output format
      const transformedResult = transformResult(
        rule(value, ...args),
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
      customMessage = undefined;

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
function transformResult<T>(
  result: RuleRunReturn<T>,
  ruleName: string,
  value: RuleValue,
  ...args: Args
): RuleDetailedResult {
  validateResult(result);

  // if result is boolean
  if (booleanRules.isBoolean(result)) {
    return ruleRunReturn(result, value);
  }
  return ruleRunReturn(
    result.pass,
    dynamicValue(result.message, ruleName, value, ...args),
  );
}

function validateResult<T>(result: RuleRunReturn<T>): void {
  // if result is boolean, or if result.pass is boolean
  invariant(
    booleanRules.isBoolean(result) ||
      (result && booleanRules.isBoolean(result.pass)),
    'Incorrect return value for rule: ' + JSON.stringify(result),
  );
}

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
};

function getRule(ruleName: keyof EnforceBase): RuleBase {
  // TODO: Fix typing by supporting message

  return allRules[ruleName as keyof typeof allRules];
}

type TRules = {
  // Only include keys where the value is a function
  [K in keyof typeof allRules as (typeof allRules)[K] extends (
    ...args: any
  ) => any
    ? K
    : never]: (
    ...args: DropFirst<
      Parameters<Extract<(typeof allRules)[K], (...args: any) => any>>
    >
  ) => EnforceEagerReturn;
};

type TModifiers = {
  message: (input: string) => EnforceEagerReturn;
};

type EnforceBase = TModifiers & TRules;

type EnforceEagerReturn = EnforceBase & {
  pass: boolean;
};

type RuleBase = (value: any, ...args: Args) => RuleRunReturn<any>;
