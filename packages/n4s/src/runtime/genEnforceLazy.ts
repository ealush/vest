import { mapFirst, optionalFunctionValue, CB, Stringable } from 'vest-utils';

import eachEnforceRule from 'eachEnforceRule';
import { ctx } from 'enforceContext';
import isProxySupported from 'isProxySupported';
import ruleReturn, { defaultToPassing, RuleDetailedResult } from 'ruleReturn';
import { RuleValue, Args, KBaseRules, getRule } from 'runtimeRules';
import { transformResult } from 'transformResult';

// eslint-disable-next-line max-lines-per-function
export default function genEnforceLazy(key: string) {
  const registeredRules: RegisteredRules = [];
  let lazyMessage: void | LazyMessage;

  return addLazyRule(key);

  // eslint-disable-next-line max-lines-per-function
  function addLazyRule(ruleName: string) {
    // eslint-disable-next-line max-lines-per-function
    return (...args: Args): Lazy => {
      const rule = getRule(ruleName);

      registeredRules.push((value: RuleValue) =>
        transformResult(rule(value, ...args), ruleName, value, ...args)
      );

      let proxy = {
        run: (value: RuleValue): RuleDetailedResult => {
          return defaultToPassing(
            mapFirst(registeredRules, (rule, breakout) => {
              const res = ctx.run({ value }, () => rule(value));

              breakout(
                !res.pass,
                ruleReturn(
                  !!res.pass,
                  optionalFunctionValue(lazyMessage, value, res.message) ??
                    res.message
                )
              );
            })
          );
        },
        test: (value: RuleValue): boolean => proxy.run(value).pass,
        message: (message: Stringable): Lazy => {
          if (message) {
            lazyMessage = message;
          }

          return proxy;
        },
      } as Lazy;

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

export type LazyRules = n4s.IRules<LazyRuleMethods>;

export type Lazy = LazyRules &
  LazyRuleMethods &
  // This is a "catch all" hack to make TS happy while not
  // losing type hints
  Record<string, CB>;

type LazyRuleMethods = LazyRuleRunners & {
  message: (message: LazyMessage) => Lazy;
};

export type LazyRuleRunners = {
  test: (value: unknown) => boolean;
  run: (value: unknown) => RuleDetailedResult;
};

export type ComposeResult = LazyRuleRunners & ((value: any) => void);

type RegisteredRules = Array<(value: RuleValue) => RuleDetailedResult>;
type LazyMessage =
  | string
  | ((value: unknown, originalMessage?: Stringable) => string);
