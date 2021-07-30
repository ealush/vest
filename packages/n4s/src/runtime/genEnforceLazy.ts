import mapFirst from 'mapFirst';

import eachEnforceRule from 'eachEnforceRule';
import { ctx } from 'enforceContext';
import isProxySupported from 'isProxySupported';
import type { TRuleDetailedResult, TLazyRuleMethods } from 'ruleReturn';
import * as ruleReturn from 'ruleReturn';
import { TRuleValue, TArgs, KBaseRules, getRule, TRules } from 'runtimeRules';
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
      } as TLazy;

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

export type TLazyRules = TRules<TLazyRuleMethods>;

export type TLazy = TLazyRules & TLazyRuleMethods;

export type TShapeObject = Record<string, TLazy>;
