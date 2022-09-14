import { invariant, StringObject, isNullish } from 'vest-utils';

import eachEnforceRule from 'eachEnforceRule';
import { ctx } from 'enforceContext';
import isProxySupported from 'isProxySupported';
import { getRule, RuleValue, Args, RuleBase, KBaseRules } from 'runtimeRules';
import { transformResult } from 'transformResult';

type IRules = n4s.IRules<Record<string, any>>;
type TModifiers = {
  message: (input: string) => EnforceEagerReturn;
  not: IRules;
};

type ModifierStorage = {
  not: boolean;
  message: string | undefined;
};

type EnforceEagerReturn = IRules & TModifiers;

// eslint-disable-next-line max-lines-per-function, max-statements
export default function enforceEager(value: RuleValue): EnforceEagerReturn {
  const modifierStorage: ModifierStorage = {
    message: undefined,
    not: false,
  };

  let proxy: EnforceEagerReturn = Object.defineProperties(
    {
      message,
    } as EnforceEagerReturn,
    {
      not: {
        get: not,
      },
    }
  );

  // This condition is for when we don't have proxy support (ES5).
  // In this case, we need to manually assign the rules to the target object on runtime.
  // The follow up proxy block is used in case we do have proxy support, and we can assign each rule upon invocation.
  if (!isProxySupported()) {
    // We iterate over each of the rules, and add them to the target object being return by enforce
    eachEnforceRule((ruleName: KBaseRules, ruleFn) => {
      // We then wrap the rule with `genRuleCall` that adds the base enforce behavior
      proxy[ruleName] = genRuleCall(proxy, ruleFn, ruleName);
    });

    return proxy;
  }

  // We create a proxy intercepting access to the target object (which is empty).
  proxy = new Proxy(proxy, {
    get: (target, key: string) => {
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
        if (!isNullish(modifierStorage.message))
          return StringObject(modifierStorage.message);
        if (isNullish(transformedResult.message)) {
          return `enforce/${ruleName} failed with ${JSON.stringify(value)}`;
        }
        return StringObject(transformedResult.message);
      }

      // On rule failure (the result is false), we either throw an error
      // or throw a string value if the rule has a message defined in it.
      invariant(
        modifierStorage.not ? !transformedResult.pass : transformedResult.pass,
        enforceMessage()
      );

      clearNot();

      return target;
    };
  }

  function message(input: string): EnforceEagerReturn {
    modifierStorage.message = input;
    return proxy;
  }

  function not() {
    modifierStorage.not = true;
    return proxy;
  }

  function clearNot() {
    modifierStorage.not = false;
  }
}

export type EnforceEager = (value: RuleValue) => EnforceEagerReturn;
