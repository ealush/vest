import { ctx } from 'enforceContext';
import type { EnforceContext } from 'enforceContext';
import { assign } from 'vest-utils';

import { RuleRunReturn } from 'RuleRunReturn';
import { enforceEager, extendEager } from 'eager';
import { addToChain, registerLazyRule } from 'genRuleChain';
import { enforceLazy } from 'lazy';

export { ctx } from 'enforceContext';
// No central barrel for schema rule types; import from colocated files as needed.
// n4s.ValueFirstRules is declared globally for typing custom rules

// Note: runtime accepts any value-first function; types are derived via n4s.ValueFirstRules

type ExtendFn = (rules: Record<string, (...args: any[]) => any>) => void;
type ContextFn = () => EnforceContext;
type Enforce = typeof enforceEager &
  typeof enforceLazy & { extend: ExtendFn; context: ContextFn };

// Build the base enforce object (callable + lazy builders)
export const enforce = assign(enforceEager, enforceLazy) as Enforce;

// Context access function
enforce.context = function context(): EnforceContext {
  return ctx.use();
};

// partial is provided via eager/lazy rule maps (validator rule)

// Type-safe extend function
// Extend API: adds custom rules to both eager and lazy interfaces
enforce.extend = function extend(
  rules: Record<string, (...args: any[]) => any>,
) {
  // Register for eager path
  extendEager(rules);

  // Register for lazy path: attach chain builders on enforce itself
  Object.keys(rules).forEach(ruleName => {
    const rule = rules[ruleName];
    // Attach as lazy builder on enforce
    (enforce as Record<string, any>)[ruleName] = (...args: any[]) =>
      addToChain({}, (value: any) => {
        const res = ctx.run({ value }, () => rule(value, ...args));
        return RuleRunReturn.create(res, value);
      });

    // Also register for chaining on any lazy rule instance
    registerLazyRule(ruleName, (...args: any[]) => (value: any) => {
      const res = ctx.run({ value }, () => rule(value, ...args));
      return RuleRunReturn.create(res, value);
    });
  });
};
