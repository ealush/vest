import { invariant, StringObject, isNullish } from 'vest-utils';

import eachEnforceRule from 'eachEnforceRule';
import { ctx } from 'enforceContext';
import isProxySupported from 'isProxySupported';
import { getRule, RuleValue, Args, RuleBase, KBaseRules } from 'runtimeRules';
import { transformResult } from 'transformResult';

type IRules = n4s.IRules<Record<string, any>>;

const MESSAGE = 'message';

export default function enforceEager(value: RuleValue): IRules {
  const target = {} as IRules;
  let customMessage: string | undefined = undefined;

  // This condition is for when we don't have proxy support (ES5).
  // In this case, we need to manually assign the rules to the target object on runtime.
  // The follow up proxy block is used in case we do have proxy support, and we can assign each rule upon invocation.
  if (!isProxySupported()) {
    // We iterate over each of the rules, and add them to the target object being return by enforce
    eachEnforceRule((ruleName: KBaseRules, ruleFn) => {
      // We then wrap the rule with `genRuleCall` that adds the base enforce behavior
      target[ruleName] = genRuleCall(target, ruleFn, ruleName);
    });

    return target;
  }

  // We create a proxy intercepting access to the target object (which is empty).
  const proxy: IRules = new Proxy(target, {
    get: (_, key: string) => {
      // On property access, we identify if it is a rule or not.
      const rule = getRule(key);

      // If it is a rule, we wrap it with `genRuleCall` that adds the base enforce behavior
      if (rule) {
        return genRuleCall(proxy, rule, key);
      }

      if (key === MESSAGE) {
        return message;
      }
    },
  });

  return proxy;

  // This function is used to wrap a rule with the base enforce behavior
  // It takes the target object, the rule function, and the rule name
  // It then returns the rule, in a manner that can be used by enforce
  function genRuleCall(target: IRules, rule: RuleBase, ruleName: string) {
    return function ruleCall(...args: Args) {
      // Order of operation:
      // 1. Create a context with the value being enforced
      // 2. Call the rule within the context, and pass over the arguments passed to it
      // 3. Transform the result to the correct output format
      const transformedResult = ctx.run({ value }, () => {
        return transformResult(rule(value, ...args), ruleName, value, ...args);
      });

      const shouldUseCustomMessage = !isNullish(customMessage);

      // On rule failure (the result is false), we either throw an error
      // or throw a string value if the rule has a message defined in it.
      invariant(
        transformedResult.pass,
        shouldUseCustomMessage
          ? customMessage
          : isNullish(transformedResult.message)
          ? `enforce/${ruleName} failed with ${JSON.stringify(value)}`
          : StringObject(transformedResult.message)
      );

      return target;
    };
  }

  function message(input: string) {
    customMessage = input;
    return proxy;
  }
}

export type EnforceEager = (value: RuleValue) => IRules;
