import defaultTo from 'defaultTo';
import type { TStringable } from 'utilityTypes';

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
  return ruleReturn(false);
}

export function passing(): TRuleDetailedResult {
  return ruleReturn(true);
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

export type TRuleReturn =
  | boolean
  | {
      pass: boolean;
      message?: TStringable;
    };

export type TRuleDetailedResult = { pass: boolean; message?: string };

export type TLazyRuleMethods = {
  test: (value: unknown) => boolean;
  run: (value: unknown) => TRuleDetailedResult;
};
