import throwError from 'throwError';

import eachEnforceRule from 'eachEnforceRule';
import { ctx } from 'enforceContext';
import { isEmpty } from 'isEmpty';
import isProxySupported from 'isProxySupported';
import {
  getRule,
  TRuleValue,
  TArgs,
  TRuleBase,
  KBaseRules,
} from 'runtimeRules';
import { transformResult } from 'transformResult';

type IRules = n4s.IRules<Record<string, any>>;

export default function enforceEager(value: TRuleValue): IRules {
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

  function genRuleCall(target: IRules, rule: TRuleBase, ruleName: string) {
    return function ruleCall(...args: TArgs) {
      const transformedResult = transformResult(
        ctx.run({ value }, () => rule(value, ...args)),
        ruleName,
        value,
        ...args
      );

      if (!transformedResult.pass) {
        if (isEmpty(transformedResult.message)) {
          throwError(
            `enforce/${ruleName} failed with ${JSON.stringify(value)}`
          );
        } else {
          // Explicitly throw a string so that vest.test can pick it up as the validation error message
          throw transformedResult.message;
        }
      }
      return target;
    };
  }
}

export type TEnforceEager = typeof enforceEager;
