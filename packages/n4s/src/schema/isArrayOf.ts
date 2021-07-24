import mapFirst from 'mapFirst';

import type { TRuleDetailedResult, TLazyRuleMethods } from 'ruleReturn';
import * as ruleReturn from 'ruleReturn';
import runLazyRule from 'runLazyRule';

export default function isArrayOf(
  inputArray: any[],
  ruleChain: TLazyRuleMethods
): TRuleDetailedResult {
  return (
    mapFirst(inputArray, (item, breakout) => {
      const res = runLazyRule(ruleChain, item);

      if (!res.pass) {
        breakout(res);
      }
    }) ?? ruleReturn.passing()
  );
}
