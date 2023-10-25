import { invariant, StringObject, isNullish, Maybe } from 'vest-utils';

import { ctx } from 'enforceContext';
import { getRule, RuleValue, Args, RuleBase } from 'runtimeRules';
import { transformResult } from 'transformResult';

type IRules = n4s.IRules<Record<string, any> & EnforceEagerReturn>;
type TModifiers = {
  message: (input: string) => EnforceEagerReturn;
};

type EnforceEagerReturn = IRules & TModifiers;

// eslint-disable-next-line max-lines-per-function
export default function enforceEager(value: RuleValue): EnforceEagerReturn {
  const target = {
    message,
  } as EnforceEagerReturn;
  let customMessage: Maybe<string> = undefined;

  // We create a proxy intercepting access to the target object (which is empty).
  const proxy: EnforceEagerReturn = new Proxy(target, {
    get: (_, key: string) => {
      // On property access, we identify if it is a rule or not.
      const rule = getRule(key);

      // If it is a rule, we wrap it with `genRuleCall` that adds the base enforce behavior
      if (rule) {
        return genRuleCall(proxy, rule, key);
      }
      return target[key];
    },
  });

  return proxy;

  // This function is used to wrap a rule with the base enforce behavior
  // It takes the target object, the rule function, and the rule name
  // It then returns the rule, in a manner that can be used by enforce
  function genRuleCall(
    target: EnforceEagerReturn,
    rule: RuleBase,
    ruleName: string
  ) {
    return function ruleCall(...args: Args) {
      // Order of operation:
      // 1. Create a context with the value being enforced
      // 2. Call the rule within the context, and pass over the arguments passed to it
      // 3. Transform the result to the correct output format
      const transformedResult = ctx.run({ value }, () => {
        return transformResult(rule(value, ...args), ruleName, value, ...args);
      });

      function enforceMessage() {
        if (!isNullish(customMessage)) return StringObject(customMessage);
        if (isNullish(transformedResult.message)) {
          return `enforce/${ruleName} failed with ${JSON.stringify(value)}`;
        }
        return StringObject(transformedResult.message);
      }

      // On rule failure (the result is false), we either throw an error
      // or throw a string value if the rule has a message defined in it.
      invariant(transformedResult.pass, enforceMessage());

      return target;
    };
  }

  function message(input: string): EnforceEagerReturn {
    customMessage = input;
    return proxy;
  }
}

export type EnforceEager = typeof enforceEager;
