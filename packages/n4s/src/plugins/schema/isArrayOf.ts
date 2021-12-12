import mapFirst from 'mapFirst';

import type { TLazy } from 'genEnforceLazy';
import { ctx } from 'n4s';
import type { TRuleDetailedResult } from 'ruleReturn';
import * as ruleReturn from 'ruleReturn';
import runLazyRule from 'runLazyRule';

export function isArrayOf(
  inputArray: any[],
  currentRule: TLazy
): TRuleDetailedResult {
  return ruleReturn.defaultToPassing(
    mapFirst(inputArray, (currentValue, breakout, index) => {
      const res = ctx.run(
        { value: currentValue, set: true, meta: { index } },
        () => runLazyRule(currentRule, currentValue)
      );

      if (!res.pass) {
        breakout(res);
      }
    })
  );
}
