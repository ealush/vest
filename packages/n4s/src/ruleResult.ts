import { dynamicValue, invariant, isNullish, StringObject } from 'vest-utils';
import type { Stringable } from 'vest-utils';

import * as booleanRules from './rules/booleanRules';

export type RuleValue = unknown;
export type Args = any[];
export type RuleDetailedResult = { pass: boolean; message?: Stringable };

export function enforceMessage(
  ruleName: string,
  transformedResult: RuleDetailedResult,
  value: RuleValue,
  customMessage?: string,
) {
  if (!isNullish(customMessage)) return StringObject(customMessage);
  if (isNullish(transformedResult.message)) {
    return `enforce/${ruleName} failed with ${JSON.stringify(value)}`;
  }
  return StringObject(transformedResult.message);
}

export function transformResult(
  result: any,
  ruleName: string,
  value: RuleValue,
  ...args: Args
): RuleDetailedResult {
  validateResult(result);

  if (booleanRules.isBoolean(result)) {
    return { pass: result };
  }

  return {
    pass: !!result.pass,
    message: dynamicValue(result.message, ruleName, value, ...args),
  };
}

export function validateResult(result: any): void {
  invariant(
    booleanRules.isBoolean(result) ||
      (result && booleanRules.isBoolean(result.pass)),
    'Incorrect return value for rule: ' + JSON.stringify(result),
  );
}
