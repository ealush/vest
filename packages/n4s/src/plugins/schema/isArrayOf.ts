import { ctx } from 'n4s';
import { mapFirst } from 'vest-utils';

import type { RuleDetailedResult } from '@/lib/ruleReturn';
import * as ruleReturn from '@/lib/ruleReturn';
import runLazyRule from '@/lib/runLazyRule';
import type { LazyRuleRunners } from '@/runtime/genEnforceLazy';

export function isArrayOf(
  inputArray: any[],
  currentRule: LazyRuleRunners,
): RuleDetailedResult {
  return ruleReturn.defaultToPassing(
    mapFirst(inputArray, (currentValue, breakout, index) => {
      const res = ctx.run(
        { value: currentValue, set: true, meta: { index } },
        () => runLazyRule(currentRule, currentValue),
      );

      breakout(!res.pass, res);
    }),
  );
}
