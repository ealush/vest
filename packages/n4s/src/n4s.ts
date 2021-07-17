import assign from 'assign';
import mapFirst from 'mapFirst';
import throwError from 'throwError';
import { DropFirst } from 'utilityTypes';

import { isEmpty } from 'isEmpty';
import type { TRuleDetailedResult, TLazyRuleMethods } from 'ruleReturn';
import * as ruleReturn from 'ruleReturn';
import {
  baseRules,
  compounds,
  getRule,
  TRule,
  TRuleValue,
  TArgs,
} from 'runtimeRules';
import { transformResult } from 'transformResult';

function EnforceBase(value: TRuleValue): TEagerRules {
  const proxy = new Proxy({} as TEagerRules, {
    get: (_, ruleName: string) => {
      const rule = getRule(ruleName);
      if (rule) {
        return (...args: TArgs) => {
          const transformedResult = transformResult(
            rule(value, ...args),
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
              throw transformedResult.message;
            }
          }
          return proxy;
        };
      }
    },
  });

  return proxy;
}

const enforce = new Proxy(EnforceBase as TEnforce, {
  get: (_: TEnforce, key: string) => {
    const registeredRules: TRegisteredRules = [];

    if (key === 'extend') {
      return function extend(customRules: TRule) {
        assign(baseRules, customRules);
      };
    }

    if (!getRule(key)) {
      return;
    }

    return addRegisteredRule(key);

    function addRegisteredRule(ruleName: string) {
      return (...args: TArgs) => {
        const rule = getRule(ruleName);

        registeredRules.push((value: TRuleValue) =>
          transformResult(rule(value, ...args), ruleName, value, ...args)
        );

        const proxy: TEnforce = new Proxy({} as TEnforce, {
          get: (_, key: string) => {
            if (getRule(key)) {
              return addRegisteredRule(key);
            }

            if (key === 'run') {
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

            if (key === 'test') {
              return (value: TRuleValue) => proxy.run(value).pass;
            }
          },
        });
        return proxy;
      };
    }
  },
});

export default enforce;

type TRegisteredRules = Array<(value: TRuleValue) => TRuleDetailedResult>;

type TEagerRules = {
  [P in keyof typeof compounds]: (
    ...args: DropFirst<Parameters<typeof compounds[P]>>
  ) => TEagerRules;
} &
  {
    [P in keyof typeof baseRules]: (
      ...args: DropFirst<Parameters<typeof baseRules[P]>>
    ) => TEagerRules;
  };

type TLazyRules = {
  [P in keyof typeof compounds]: (
    ...args: DropFirst<Parameters<typeof compounds[P]>> | TArgs
  ) => TLazyRules & TLazyRuleMethods;
} &
  {
    [P in keyof typeof baseRules]: (
      ...args: DropFirst<Parameters<typeof baseRules[P]>> | TArgs
    ) => TLazyRules & TLazyRuleMethods;
  };

type TEnforce = typeof EnforceBase &
  TLazyRules & { extend: (customRules: TRule) => void } & TLazyRuleMethods;
