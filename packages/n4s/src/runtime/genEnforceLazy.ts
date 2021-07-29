import mapFirst from 'mapFirst';
import { DropFirst } from 'utilityTypes';

import type { TCompounds } from 'compounds';
import eachEnforceRule from 'eachEnforceRule';
import type { TEnforce } from 'enforce';
import { ctx } from 'enforceContext';
import isProxySupported from 'isProxySupported';
import type { TRuleDetailedResult, TLazyRuleMethods } from 'ruleReturn';
import * as ruleReturn from 'ruleReturn';
import {
  TRuleValue,
  TArgs,
  KBaseRules,
  TBaseRules,
  getRule,
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

      let proxy = {
        run: genRun(),
        test: genTest(),
      } as TEnforce;

      if (!isProxySupported()) {
        eachEnforceRule((ruleName: KBaseRules) => {
          proxy[ruleName] = addLazyRule(ruleName);
        });

        return proxy;
      }

      // reassigning the proxy here is not pretty
      // but it's a cleaner way of getting `run` and `test` for free
      proxy = new Proxy(proxy, {
        get: (target, key: string) => {
          if (getRule(key)) {
            return addLazyRule(key);
          }

          return target[key]; // already has `run` and `test` on it
        },
      });
      return proxy;

      function genRun() {
        return (value: TRuleValue): TRuleDetailedResult => {
          return ruleReturn.defaultToPassing(
            mapFirst(registeredRules, (rule, breakout) => {
              const res = ctx.run({ value }, () => rule(value));

              if (!res.pass) {
                breakout(res);
              }
            })
          );
        };
      }

      function genTest() {
        return (value: TRuleValue): boolean => proxy.run(value).pass;
      }
    };
  }
}

export type TLazyRules = Record<string, (...args: TArgs) => TLazy> &
  {
    [P in keyof TCompounds]: (
      ...args: DropFirst<Parameters<TCompounds[P]>> | TArgs
    ) => TLazy;
  } &
  {
    [P in KBaseRules]: (
      ...args: DropFirst<Parameters<TBaseRules[P]>> | TArgs
    ) => TLazy;
  };

export type TLazy = TLazyRules & TLazyRuleMethods;

export type TShapeObject = Record<string, TLazy>;
