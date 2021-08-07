import mapFirst from 'mapFirst';
import optionalFunctionValue from 'optionalFunctionValue';
import { TStringable } from 'utilityTypes';

import eachEnforceRule from 'eachEnforceRule';
import { ctx } from 'enforceContext';
import isProxySupported from 'isProxySupported';
import ruleReturn, { defaultToPassing, TRuleDetailedResult } from 'ruleReturn';
import { TRuleValue, TArgs, KBaseRules, getRule, TRules } from 'runtimeRules';
import { transformResult } from 'transformResult';

export default function genEnforceLazy(key: string) {
  const registeredRules: TRegisteredRules = [];
  let lazyMessage: void | TLazyMessage;

  return addLazyRule(key);

  function addLazyRule(ruleName: string) {
    return (...args: TArgs): TLazy => {
      const rule = getRule(ruleName);

      registeredRules.push((value: TRuleValue) =>
        transformResult(rule(value, ...args), ruleName, value, ...args)
      );

      let proxy = {
        run: (value: TRuleValue): TRuleDetailedResult => {
          return defaultToPassing(
            mapFirst(registeredRules, (rule, breakout) => {
              const res = ctx.run({ value }, () => rule(value));

              if (!res.pass) {
                breakout(
                  ruleReturn(
                    !!res.pass,
                    optionalFunctionValue(lazyMessage, value, res.message) ??
                      res.message
                  )
                );
              }
            })
          );
        },
        test: (value: TRuleValue): boolean => proxy.run(value).pass,
        message: (message: TStringable): TLazy => {
          if (message) {
            lazyMessage = message;
          }

          return proxy;
        },
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
    };
  }
}

export type TLazyRules = TRules<TLazyRuleMethods>;

export type TLazy = TLazyRules & TLazyRuleMethods;

export type TShapeObject = Record<any, TLazy>;

export type TLazyRuleRunners = {
  test: (value: unknown) => boolean;
  run: (value: unknown) => TRuleDetailedResult;
};

type TLazyRuleMethods = TLazyRuleRunners & {
  message: (message: TLazyMessage) => TLazy;
};

type TRegisteredRules = Array<(value: TRuleValue) => TRuleDetailedResult>;
type TLazyMessage =
  | string
  | ((value: unknown, originalMessage?: TStringable) => string);
