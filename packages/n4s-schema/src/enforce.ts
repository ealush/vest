import { assign } from 'vest-utils';

import { enforceEager, extendEager } from 'eager';
import { addToChain, registerLazyRule } from 'genRuleChain';
import { enforceLazy } from 'lazy';

type CustomRule = (
  value: any,
  ...args: any[]
) => boolean | { pass: boolean; message?: string | (() => string) };

// Build the base enforce object
export const enforce: any = assign(enforceEager, enforceLazy);

// TODO: IMPROVE this API, add type support
// Extend API: adds custom rules to both eager and lazy interfaces
enforce.extend = function extend(rules: Record<string, CustomRule>) {
  // Register for eager path
  extendEager(rules);

  // Register for lazy path: attach chain builders on enforce itself
  Object.keys(rules).forEach(ruleName => {
    const rule = rules[ruleName];
    // Attach as lazy builder on enforce
    enforce[ruleName] = (...args: any[]) =>
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
