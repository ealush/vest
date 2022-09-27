// This file hurts my brain.

/* eslint-disable max-statements */
import {
  assign,
  isFunction,
  mapFirst,
  optionalFunctionValue,
  Stringable,
  hasOwnProperty,
  CB,
} from 'vest-utils';

import eachEnforceRule from 'eachEnforceRule';
import { ctx, EnforceContext } from 'enforceContext';
import enforceEager, { EnforceEager } from 'enforceEager';
import { Lazy, LazyRules } from 'genEnforceLazy';
import isProxySupported from 'isProxySupported';
import ruleReturn, { defaultToPassing, RuleDetailedResult } from 'ruleReturn';
import {
  Rule,
  baseRules,
  Args,
  getRule,
  RuleValue,
  RuleBase,
} from 'runtimeRules';
import { transformResult } from 'transformResult';

// eslint-disable-next-line max-lines-per-function
function genEnforce() {
  const enforceMethods = {
    context: () => ctx.useX(),
    extend(customRules: Rule) {
      assign(baseRules, customRules);
    },
  } as Enforce;

  if (isProxySupported()) {
    enforceMethods.extend = function extend(customRules: Rule) {
      assign(baseRules, customRules);
      for (const customRule in customRules) {
        Object.defineProperty(enforceEager, customRule, {
          get() {
            return (...args: Args) => {
              const enforceLazyState = getEnforceLazyState();
              const tail = getTail(enforceLazyState);
              const chain = {};

              applyOperation(
                enforceLazyState,
                chain as Lazy,
                customRule
              )(...args);
              return assign(chain, tail);
            };
          },
        });
      }
    };

    eachEnforceRule((key: string) => {
      const enforceLazyState = getEnforceLazyState();
      const tail = getTail(enforceLazyState);

      const chain = {};

      // @ts-ignore
      enforceEager[key] = applyOperation(
        enforceLazyState,
        // @ts-ignore
        chain as Lazy,
        key
      );

      return assign(chain, tail);
    });

    return assign(enforceEager, enforceMethods);
  }

  return new Proxy(enforceEager as Enforce, {
    // eslint-disable-next-line max-lines-per-function
    get(target: Enforce, key: string) {
      const enforceLazyState = getEnforceLazyState();

      if (isFunction(enforceMethods[key])) {
        return enforceMethods[key];
      }

      if (hasOwnProperty(target, key)) {
        return target[key];
      }

      const tail = getTail(enforceLazyState);

      const chain: Lazy = new Proxy(tail as Lazy, {
        get(_, key: string) {
          if (hasOwnProperty(tail, key)) {
            return tail[key];
          }

          return applyOperation(enforceLazyState, chain, key);
        },
      });

      return applyOperation(enforceLazyState, chain, key);
    },
  });
}

function getTail(enforceLazyState: EnforceLazyState) {
  const { appliedOperations, modifierStorage } = enforceLazyState;

  return {
    run,
    test,
  };

  function test(value: RuleValue): boolean {
    return run(value).pass;
  }

  function run(value: RuleValue): RuleDetailedResult {
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
  }
}

function getEnforceLazyState() {
  const appliedOperations: AppliedOperations = [];
  const modifierStorage: ModifierStorage = {
    message: undefined,
  };

  return {
    appliedOperations,
    modifierStorage,
  };
}

// eslint-disable-next-line max-lines-per-function
function applyOperation(
  enforceLazyState: EnforceLazyState,
  chain: Lazy,
  key: string
) {
  const { appliedOperations, modifierStorage } = enforceLazyState;

  const modifiers = {
    message,
  };

  if (hasOwnProperty(modifiers, key) && isFunction(modifiers[key])) {
    return (...args: Args) => {
      appliedOperations.push(
        getActiveModifierOperation(modifiers[key], key, ...args)
      );

      return chain;
    };
  }

  return (...args: Args) => {
    const rule = getRule(key);
    appliedOperations.push(getRuleOperation(rule, key, ...args));

    return chain;
  };

  function message(msg: Stringable): Lazy {
    if (msg) {
      modifierStorage.message = msg;
    }

    return chain;
  }
}

function getRuleOperation(
  rule: RuleBase,
  key: string,
  ...args: Args
): RuleOperation {
  return {
    type: AppliedTypes.RULE,
    name: key,
    operation: (value: RuleValue) => {
      return transformResult(rule(value, ...args), key, value, ...args);
    },
  };
}

function getActiveModifierOperation(
  modifier: CB,
  key: string,
  ...args: Args
): ActiveModifierOperation {
  return {
    type: AppliedTypes.ACTIVE_MODIFIER,
    name: key,
    operation() {
      modifier(...args);
    },
  };
}

export const enforce = genEnforce();

export type Enforce = EnforceMethods & LazyRules & EnforceEager;

type ModifierStorage = {
  message: Stringable | undefined;
};

type EnforceMethods = {
  context: () => EnforceContext;
  extend: (customRules: Rule) => void;
};

type RuleOperation = {
  type: AppliedTypes.RULE;
  name: string;
  operation: (value: RuleValue) => RuleDetailedResult;
};

type ActiveModifierOperation = {
  type: AppliedTypes.ACTIVE_MODIFIER;
  name: string;
  operation: CB;
};

type AppliedOperations = Array<RuleOperation | ActiveModifierOperation>;

enum AppliedTypes {
  RULE,
  ACTIVE_MODIFIER,
  PASSIVE_MODIFIER,
}

type EnforceLazyState = {
  appliedOperations: AppliedOperations;
  modifierStorage: ModifierStorage;
};
