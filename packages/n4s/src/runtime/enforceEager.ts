import { invariant, StringObject, isNullish } from 'vest-utils';

import eachEnforceRule from 'eachEnforceRule';
import { ctx } from 'enforceContext';
import isProxySupported from 'isProxySupported';
import { getRule, RuleValue, Args, RuleBase, KBaseRules } from 'runtimeRules';
import { transformResult } from 'transformResult';

type IRules = n4s.IRules<Record<string, any>>;

export default function enforceEager(value: RuleValue): IRules {
  const target = {} as IRules;
  if (!isProxySupported()) {
    eachEnforceRule((ruleName: KBaseRules, ruleFn) => {
      target[ruleName] = genRuleCall(target, ruleFn, ruleName);
    });

    return target;
  }

  const proxy: IRules = new Proxy(target, {
    get: (_, ruleName: string) => {
      const rule = getRule(ruleName);
      if (rule) {
        return genRuleCall(proxy, rule, ruleName);
      }
    },
  });

  return proxy;

  function genRuleCall(target: IRules, rule: RuleBase, ruleName: string) {
    return function ruleCall(...args: Args) {
      const transformedResult = ctx.run({ value }, () =>
        transformResult(rule(value, ...args), ruleName, value, ...args)
      );

      invariant(
        transformedResult.pass,
        isNullish(transformedResult.message)
          ? `enforce/${ruleName} failed with ${JSON.stringify(value)}`
          : StringObject(transformedResult.message)
      );

      return target;
    };
  }
}

export type EnforceEager = typeof enforceEager;
