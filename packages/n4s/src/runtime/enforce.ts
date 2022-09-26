/* eslint-disable max-statements */
import {
  assign,
  isFunction,
  mapFirst,
  optionalFunctionValue,
  Stringable,
  hasOwnProperty,
} from 'vest-utils';

import { ctx, EnforceContext } from 'enforceContext';
import enforceEager, { EnforceEager } from 'enforceEager';
import { Lazy, LazyRules } from 'genEnforceLazy';
import ruleReturn, { defaultToPassing, RuleDetailedResult } from 'ruleReturn';
import { Rule, baseRules, Args, getRule, RuleValue } from 'runtimeRules';
import { transformResult } from 'transformResult';

const enforceMethods = {
  context: () => ctx.useX(),
  extend: (customRules: Rule) => {
    assign(baseRules, customRules);
  },
} as Enforce;

export const enforce = new Proxy(enforceEager as Enforce, {
  // eslint-disable-next-line max-lines-per-function
  get(target: Enforce, key: string) {
    const appliedOperations: AppliedOperations = [];
    const modifierStorage: ModifierStorage = {
      message: undefined,
    };

    if (isFunction(enforceMethods[key])) {
      return enforceMethods[key];
    }

    if (hasOwnProperty(target, key)) {
      return target[key];
    }

    const tail = {
      run(value: RuleValue): RuleDetailedResult {
        return defaultToPassing(
          mapFirst(appliedOperations, ({ type, operation }, breakout) => {
            if (type === AppliedTypes.ACTIVE_MODIFIER) {
              return operation();
            }

            const res = ctx.run({ value }, () => operation(value));

            breakout(
              !res.pass,
              ruleReturn(
                !!res.pass,
                optionalFunctionValue(
                  modifierStorage.message,
                  value,
                  res.message
                ) ?? res.message
              )
            );
          })
        );
      },
      test(value: RuleValue): boolean {
        return tail.run(value).pass;
      },
    };

    const modifiers = {
      message,
    };

    const proxy: Lazy = new Proxy(tail as Lazy, {
      get(_, key: string) {
        if (hasOwnProperty(tail, key)) {
          return tail[key];
        }

        return applyOperation(key);
      },
    });

    return applyOperation(key);

    function applyOperation(key: string) {
      const rule = getRule(key);

      if (isFunction(rule)) {
        return (...args: Args) => {
          appliedOperations.push({
            type: AppliedTypes.RULE,
            name: key,
            operation: (value: RuleValue) => {
              return transformResult(rule(value, ...args), key, value, ...args);
            },
          });

          return proxy;
        };
      }

      if (!hasOwnProperty(modifiers, key)) {
        return;
      }

      const modifier = modifiers[key];

      if (isFunction(modifier)) {
        return (...args: Args) => {
          appliedOperations.push({
            type: AppliedTypes.ACTIVE_MODIFIER,
            name: key,
            operation() {
              modifier(...args);
            },
          });

          return proxy;
        };
      }
    }

    function message(msg: Stringable): Lazy {
      if (msg) {
        modifierStorage.message = msg;
      }

      return proxy;
    }
  },
});

export type Enforce = EnforceMethods & LazyRules & EnforceEager;

type ModifierStorage = {
  message: Stringable | undefined;
};

type EnforceMethods = {
  context: () => EnforceContext;
  extend: (customRules: Rule) => void;
};

type AppliedOperations = Array<
  | {
      type: AppliedTypes.RULE;
      name: string;
      operation: (value: RuleValue) => RuleDetailedResult;
    }
  | {
      type: AppliedTypes.ACTIVE_MODIFIER;
      name: string;
      operation: (...args: Args) => void;
    }
>;

enum AppliedTypes {
  RULE,
  ACTIVE_MODIFIER,
  PASSIVE_MODIFIER,
}
