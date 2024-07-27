import { mapFirst } from 'vest-utils';

import type { RuleDetailedResult } from '@/lib/ruleReturn';
import * as ruleReturn from '@/lib/ruleReturn';
import runLazyRule from '@/lib/runLazyRule';
import type { Lazy } from '@/runtime/genEnforceLazy';

export function noneOf(value: unknown, ...rules: Lazy[]): RuleDetailedResult {
  return ruleReturn.defaultToPassing(
    mapFirst(rules, (rule, breakout) => {
      const res = runLazyRule(rule, value);

      breakout(res.pass, ruleReturn.failing());
    }),
  );
}
