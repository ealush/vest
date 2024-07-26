import { mapFirst } from 'vest-utils';

import type { Lazy } from '@/runtime/genEnforceLazy';
import * as ruleReturn from '@/lib/ruleReturn';
import type { RuleDetailedResult } from '@/lib/ruleReturn';
import runLazyRule from '@/lib/runLazyRule';

export function anyOf(value: unknown, ...rules: Lazy[]): RuleDetailedResult {
  return ruleReturn.defaultToFailing(
    mapFirst(rules, (rule, breakout) => {
      const res = runLazyRule(rule, value);
      breakout(res.pass, res);
    }),
  );
}
