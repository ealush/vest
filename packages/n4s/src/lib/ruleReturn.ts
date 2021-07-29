import defaultTo from 'defaultTo';

import { TEnforceContext } from 'enforceContext';
import type { TModifiers } from 'modifiers';
import { TRule } from 'runtimeRules';

export type TRuleReturn =
  | boolean
  | {
      pass: boolean;
      message?: string | (() => string);
    };

export type TRuleDetailedResult = { pass: boolean; message?: string };

export type TLazyRuleMethods = TModifiers & {
  test: (value: unknown) => boolean;
  run: (value: unknown) => TRuleDetailedResult;
  context: () => TEnforceContext;
  extend: (customRules: TRule) => void;
};

export function ruleReturn(
  pass: boolean,
  message?: string
): TRuleDetailedResult {
  const output: TRuleDetailedResult = { pass };

  if (message) {
    output.message = message;
  }

  return output;
}

export function failing(): TRuleDetailedResult {
  return { pass: false };
}

export function passing(): TRuleDetailedResult {
  return { pass: true };
}

export function defaultToFailing(
  callback: (...args: any[]) => TRuleDetailedResult
): TRuleDetailedResult {
  return defaultTo(callback, failing());
}

export function defaultToPassing(
  callback: (...args: any[]) => TRuleDetailedResult
): TRuleDetailedResult {
  return defaultTo(callback, passing());
}
