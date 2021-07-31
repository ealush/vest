import isBooleanValue from 'isBooleanValue';
import optionalFunctionValue from 'optionalFunctionValue';
import throwError from 'throwError';

import ruleReturn, { TRuleReturn, TRuleDetailedResult } from 'ruleReturn';
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
  validateResult(result);

  // if result is boolean
  if (isBooleanValue(result)) {
    return ruleReturn(result);
  } else {
    return ruleReturn(
      result.pass,
      optionalFunctionValue(result.message, ruleName, value, ...args)
    );
  }
}

function validateResult(result: TRuleReturn): void {
  // if result is boolean, or if result.pass is boolean
  if (isBooleanValue(result) || (result && isBooleanValue(result.pass))) {
    return;
  }

  throwError('Incorrect return value for rule: ' + JSON.stringify(result));
}
