import mapFirst from 'mapFirst';

import type { TRuleDetailedResult, TLazyRuleMethods } from 'ruleReturn';
import * as ruleReturn from 'ruleReturn';
import runLazyRule from 'runLazyRule';

export default function noneOf(
  value: unknown,
  ...rules: TLazyRuleMethods[]
): TRuleDetailedResult {
  return (
    mapFirst(rules, (rule, breakout) => {
      const res = runLazyRule(rule, value);

      if (res.pass) {
        breakout(ruleReturn.failing());
      }
    }) ?? ruleReturn.passing()
  );
}
