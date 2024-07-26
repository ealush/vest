import { isNullish } from 'vest-utils';

import type { Lazy } from '@/runtime/genEnforceLazy';
import type { RuleDetailedResult } from '@/lib/ruleReturn';
import * as ruleReturn from '@/lib/ruleReturn';
import runLazyRule from '@/lib/runLazyRule';

export function optional(value: any, ruleChain: Lazy): RuleDetailedResult {
  if (isNullish(value)) {
    return ruleReturn.passing();
  }
  return runLazyRule(ruleChain, value);
}
