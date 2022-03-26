import defaultTo from 'defaultTo';
import type { Stringable } from 'utilityTypes';

export default function ruleReturn(
  pass: boolean,
  message?: string
): RuleDetailedResult {
  const output: RuleDetailedResult = { pass };

  if (message) {
    output.message = message;
  }

  return output;
}

export function failing(): RuleDetailedResult {
  return ruleReturn(false);
}

export function passing(): RuleDetailedResult {
  return ruleReturn(true);
}

export function defaultToFailing(
  callback: (...args: any[]) => RuleDetailedResult
): RuleDetailedResult {
  return defaultTo(callback, failing());
}

export function defaultToPassing(
  callback: (...args: any[]) => RuleDetailedResult
): RuleDetailedResult {
  return defaultTo(callback, passing());
}

export type RuleReturn =
  | boolean
  | {
      pass: boolean;
      message?: Stringable;
    };

export type RuleDetailedResult = { pass: boolean; message?: string };
