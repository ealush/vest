import mapFirst from 'mapFirst';
import { DropFirst } from 'utilityTypes';

import type { TCompounds } from 'compounds';
import eachEnforceRule from 'eachEnforceRule';
import type { TEnforce } from 'enforce';
import isProxySupported from 'isProxySupported';
import type { TRuleDetailedResult, TLazyRuleMethods } from 'ruleReturn';
import * as ruleReturn from 'ruleReturn';
import {
  TRuleValue,
  TArgs,
  TBaseRules,
  getRule,
  baseRules,
} from 'runtimeRules';
import { transformResult } from 'transformResult';

type TRegisteredRules = Array<(value: TRuleValue) => TRuleDetailedResult>;

export default function genEnforceLazy(key: string) {
  const registeredRules: TRegisteredRules = [];

  return addLazyRule(key);

  function addLazyRule(ruleName: string) {
    return (...args: TArgs) => {
      const rule = getRule(ruleName);

      registeredRules.push((value: TRuleValue) =>
        transformResult(rule(value, ...args), ruleName, value, ...args)
      );

      let proxy = {} as TEnforce;

      if (!isProxySupported()) {
        eachEnforceRule((ruleName: TBaseRules) => {
          proxy[ruleName] = addLazyRule(ruleName);
        });

        proxy.run = genRun();
        proxy.test = genTest();

        return proxy;
      }

      proxy = new Proxy({} as TEnforce, {
        get: (_, key: string) => {
          if (getRule(key)) {
            return addLazyRule(key);
          }

          if (key === 'run') {
            return genRun();
          }

          if (key === 'test') {
            return genTest();
          }
        },
      });
      return proxy;

      function genRun() {
        return (value: TRuleValue) => {
          return (
            mapFirst(registeredRules, (rule, breakout) => {
              const res = rule(value);

              if (!res.pass) {
                breakout(res);
              }
            }) ?? ruleReturn.passing()
          );
        };
      }

      function genTest() {
        return (value: TRuleValue) => proxy.run(value).pass;
      }
    };
  }
}

export type TLazyRules = {
  [P in keyof TCompounds]: (
    ...args: DropFirst<Parameters<TCompounds[P]>> | TArgs
  ) => TLazyRules & TLazyRuleMethods;
} &
  {
    [P in TBaseRules]: (
      ...args: DropFirst<Parameters<typeof baseRules[P]>> | TArgs
    ) => TLazyRules & TLazyRuleMethods;
  };
