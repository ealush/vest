import { invariant, optionalFunctionValue, isBoolean } from 'vest-utils';

import ruleReturn, { RuleReturn, RuleDetailedResult } from 'ruleReturn';
import type { RuleValue, Args } from 'runtimeRules';

/**
 * Transform the result of a rule into a standard format
 */
export function transformResult(
  result: RuleReturn,
  ruleName: string,
  value: RuleValue,
  ...args: Args
): RuleDetailedResult {
  validateResult(result);

  // if result is boolean
  if (isBoolean(result)) {
    return ruleReturn(result);
  } else {
    return ruleReturn(
      result.pass,
      optionalFunctionValue(result.message, ruleName, value, ...args)
    );
  }
}

function validateResult(result: RuleReturn): void {
  // if result is boolean, or if result.pass is boolean
  invariant(
    isBoolean(result) || (result && isBoolean(result.pass)),
    'Incorrect return value for rule: ' + JSON.stringify(result)
  );
}
