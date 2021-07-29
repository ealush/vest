import throwError from 'throwError';
import { DropFirst } from 'utilityTypes';

import type { TCompounds } from 'compounds';
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
  TBaseRules,
} from 'runtimeRules';
import { transformResult } from 'transformResult';

export default function enforceEager(value: TRuleValue): TEagerRules {
  const target = {} as TEagerRules;
  if (!isProxySupported()) {
    eachEnforceRule((ruleName: KBaseRules, ruleFn) => {
      target[ruleName] = genRuleCall(target, ruleFn, ruleName);
    });

    return target;
  }

  const proxy = new Proxy(target, {
    get: (_, ruleName: string) => {
      const rule = getRule(ruleName);
      if (rule) {
        return genRuleCall(proxy, rule, ruleName);
      }
    },
  }) as TEagerRules;

  return proxy;

  function genRuleCall(target: TEagerRules, rule: TRuleBase, ruleName: string) {
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

type TEagerRules = Record<string, (...args: TArgs) => TEagerRules> &
  {
    [P in keyof TCompounds]: (
      ...args: DropFirst<Parameters<TCompounds[P]>>
    ) => TEagerRules;
  } &
  {
    [P in KBaseRules]: (
      ...args: DropFirst<Parameters<TBaseRules[P]>>
    ) => TEagerRules;
  };
