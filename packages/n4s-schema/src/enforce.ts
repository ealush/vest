import { assign } from 'vest-utils';

import { enforceEager, extendEager } from 'eager';
import { addToChain, registerLazyRule } from 'genRuleChain';
import { enforceLazy } from 'lazy';
// n4s.ValueFirstRules is declared globally for typing custom rules

// Note: runtime accepts any value-first function; types are derived via n4s.ValueFirstRules

type ExtendFn = (rules: Record<string, (...args: any[]) => any>) => void;
type Enforce = typeof enforceEager & typeof enforceLazy & { extend: ExtendFn };

// Build the base enforce object (callable + lazy builders)
export const enforce = assign(enforceEager, enforceLazy) as Enforce;

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
      addToChain({}, (value: any) => normalizeResult(rule(value, ...args)));

    // Also register for chaining on any lazy rule instance
    registerLazyRule(
      ruleName,
      (...args: any[]) =>
        (value: any) =>
          normalizeResult(rule(value, ...args)),
    );
  });
};

function normalizeResult(res: any): boolean {
  if (typeof res === 'boolean') return res;
  if (res && typeof res.pass === 'boolean') return !!res.pass;
  return false;
}
