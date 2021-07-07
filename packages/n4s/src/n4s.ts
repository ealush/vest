import throwError from 'throwError';
import { DropFirst } from 'utilityTypes';

import { isEmpty } from 'isEmpty';
import type {
  TRuleReturn,
  TRuleDetailedResult,
  TLazyRuleMethods,
} from 'ruleReturn';
import { baseRules, compounds, TRule, TRuleValue, TArgs } from 'runtimeRules';
import { transformResult } from 'transformResult';


const rules: typeof baseRules &
  Record<string, (...args: TArgs) => TRuleReturn> = {
  ...baseRules,
};

function EnforceBase(value: TRuleValue): TEaegerRules {
  const proxy = new Proxy({} as TEaegerRules, {
    get: (target, ruleName: string) => {
      // @ts-ignore - this is actually fine
      const rule = rules[ruleName] || compounds[ruleName];
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
        };
      }

      return target[ruleName];
    },
  });

  return proxy;
}

const enforce = new Proxy(EnforceBase as TEnforce, {
  get: (target: TEnforce, key: string) => {
    const registeredRules: Array<(value: TRuleValue) => TRuleDetailedResult> =
      [];

    if (key === 'extend') {
      return function extend(customRules: TRule) {
        Object.assign(rules, customRules);
      };
    }

    // @ts-ignore - this is actually fine
    if (!rules[key] || !compounds[key]) {
      return target[key];
    }

    function addRegisteredRule(ruleName: string) {
      return (...args: TArgs) => {
        // @ts-ignore - this is actually fine
        const rule = rules[ruleName] || compounds[ruleName];

        registeredRules.push((value: TRuleValue) =>
          transformResult(rule(value, ...args), ruleName, value, ...args)
        );

        const proxy: TEnforce = new Proxy({} as TEnforce, {
          get: (target, key: string) => {
            if (rules[key]) {
              return addRegisteredRule(key);
            }

            if (key === 'run') {
              return (value: TRuleValue) => {
                return (
                  registeredRules.find(rule => !rule(value).pass) ?? {
                    pass: true,
                  }
                );
              };
            }

            if (key === 'test') {
              // @ts-ignore need to fix this
              return (value: TRuleValue) => proxy.run(value).pass;
            }

            return target[key];
          },
        });
        return proxy;
      };
    }

    return addRegisteredRule(key);
  },
});

export default enforce;

type TEaegerRules = {
  [P in keyof typeof compounds]: (
    ...args: DropFirst<Parameters<typeof compounds[P]>>
  ) => TEaegerRules;
} &
  {
    [P in keyof typeof rules]: (
      ...args: DropFirst<Parameters<typeof rules[P]>>
    ) => TEaegerRules;
  };

type TLazyRules = {
  [P in keyof typeof compounds]: (
    ...args: DropFirst<Parameters<typeof compounds[P]>>
  ) => TLazyRules & TLazyRuleMethods;
} &
  {
    [P in keyof typeof rules]: (
      ...args: DropFirst<Parameters<typeof rules[P]>>
    ) => TLazyRules & TLazyRuleMethods;
  };

type TEnforce = typeof EnforceBase &
  TLazyRules & { extend: (customRules: TRule) => void };
