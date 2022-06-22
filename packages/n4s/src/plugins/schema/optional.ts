import { isNullish } from 'vest-utils';

import type { Lazy } from 'genEnforceLazy';
import type { RuleDetailedResult } from 'ruleReturn';
import * as ruleReturn from 'ruleReturn';
import runLazyRule from 'runLazyRule';

export function optional(value: any, ruleChain: Lazy): RuleDetailedResult {
  if (isNullish(value)) {
    return ruleReturn.passing();
  }
  return runLazyRule(ruleChain, value);
}
