import assign from 'assign';

import eachEnforceRule from 'eachEnforceRule';
import { TEnforceContext, ctx } from 'enforceContext';
import enforceEager, { TEnforceEager } from 'enforceEager';
import genEnforceLazy, { TLazyRules } from 'genEnforceLazy';
import isProxySupported from 'isProxySupported';
import modifiers, { TModifiers } from 'modifiers';
import { TRule, KBaseRules, baseRules, getRule } from 'runtimeRules';

/**
 * Enforce is quite complicated, I want to explain it in detail.
 * It is dynamic in nature, so a lot of proxy objects are involved.
 *
 * Enforce has two main interfaces
 * 1. eager
 * 2. lazy
 *
 * The eager interface is the most commonly used, and the easier to understand.
 * It throws an error when a rule is not satisfied.
 * The eager interface is declared in enforceEager.ts and it is quite simple to understand.
 * enforce is called with a value, and the return value is a proxy object that points back to all the rules.
 * When a rule is called, the value is mapped as its first argument, and if the rule passes, the same
 * proxy object is returned. Otherwise, an error is thrown.
 *
 * The lazy interface works quite differently. It is declared in genEnforceLazy.ts.
 * Rather than calling enforce directly, the lazy interface has all the rules as "methods" (only by proxy).
 * Calling the first function in the chain will initialize an array of calls. It stores the different rule calls
 * and the parameters passed to them. None of the rules are called yet.
 * The rules are only invoked in sequence once either of these chained functions are called:
 * 1. test(value)
 * 2. run(value)
 *
 * Calling run or test will call all the rules in sequence, with the difference that test will only return a boolean value,
 * while run will return an object with the validation result and an optional message created by the rule.
 */

function genEnforce(): TEnforce {
  const target = {
    extend: (customRules: TRule) => {
      assign(baseRules, customRules);
    },
    context: () => ctx.useX(),
    ...modifiers(),
  } as TEnforce;

  if (!isProxySupported()) {
    eachEnforceRule((ruleName: KBaseRules) => {
      // Only on the first rule access - start the chain of calls
      target[ruleName] = genEnforceLazy(ruleName);
    });

    return target;
  }

  return new Proxy(assign(enforceEager, target) as TEnforce, {
    get: (target: TEnforce, key: string) => {
      if (key in target) {
        return target[key];
      }

      if (!getRule(key)) {
        return;
      }

      // Only on the first rule access - start the chain of calls
      return genEnforceLazy(key);
    },
  });
}

const enforce = genEnforce();

export default enforce;

type TEnforce = TEnforceEager & TLazyRules & TEnforceMethods;

type TEnforceMethods = TModifiers & {
  context: () => TEnforceContext;
  extend: (customRules: TRule) => void;
};
