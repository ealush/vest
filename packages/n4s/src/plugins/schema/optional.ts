import { isNullish } from 'isNullish';

import type { TLazy } from 'genEnforceLazy';
import type { TRuleDetailedResult } from 'ruleReturn';
import * as ruleReturn from 'ruleReturn';
import runLazyRule from 'runLazyRule';

export function optional(value: any, ruleChain: TLazy): TRuleDetailedResult {
  if (isNullish(value)) {
    return ruleReturn.passing();
  }
  return runLazyRule(ruleChain, value);
}
