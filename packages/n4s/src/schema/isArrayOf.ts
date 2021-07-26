import mapFirst from 'mapFirst';

import { ctx } from 'enforceContext';
import type { TLazy } from 'genEnforceLazy';
import type { TRuleDetailedResult } from 'ruleReturn';
import * as ruleReturn from 'ruleReturn';
import runLazyRule from 'runLazyRule';

export default function isArrayOf(
  inputArray: any[],
  currentRule: TLazy
): TRuleDetailedResult {
  return (
    mapFirst(inputArray, (currentValue, breakout, index) => {
      const res = ctx.run(
        { value: currentValue, set: true, meta: { index } },
        () => runLazyRule(currentRule, currentValue)
      );

      if (!res.pass) {
        breakout(res);
      }
    }) ?? ruleReturn.passing()
  );
}
