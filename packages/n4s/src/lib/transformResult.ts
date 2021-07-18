import isBooleanValue from 'isBooleanValue';
import optionalFunctionValue from 'optionalFunctionValue';
import throwError from 'throwError';

import type { TRuleReturn, TRuleDetailedResult } from 'ruleReturn';
import type { TRuleValue, TArgs } from 'runtimeRules';

/**
 * Transform the result of a rule into a standard format
 */
export function transformResult(
  result: TRuleReturn,
  ruleName: string,
  value: TRuleValue,
  ...args: TArgs
): TRuleDetailedResult {
  const defaultResult = getDefaultResult(value);
  validateResult(result);

  // if result is boolean
  if (isBooleanValue(result)) {
    return {
      pass: result,
    };
  } else {
    return {
      ...defaultResult,
      pass: result.pass,
      ...(result.message && {
        message: optionalFunctionValue(
          result.message,
          ruleName,
          value,
          ...args
        ),
      }),
    };
  }
}

function validateResult(result: TRuleReturn): void {
  // if result is boolean, or if result.pass is boolean
  if (isBooleanValue(result) || (result && isBooleanValue(result.pass))) {
    return;
  }

  throwError('Incorrect return value for rule: ' + JSON.stringify(result));
}

function getDefaultResult(value: TRuleValue): {
  message: string;
  pass?: boolean;
} {
  return {
    message: `invalid ${typeof value} value`,
  };
}
