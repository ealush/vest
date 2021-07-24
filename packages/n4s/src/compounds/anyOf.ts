import mapFirst from 'mapFirst';

import * as ruleReturn from 'ruleReturn';
import type { TRuleDetailedResult, TLazyRuleMethods } from 'ruleReturn';
import runLazyRule from 'runLazyRule';

export default function anyOf(
  value: unknown,
  ...rules: TLazyRuleMethods[]
): TRuleDetailedResult {
  return (
    mapFirst(rules, (rule, breakout) => {
      const res = runLazyRule(rule, value);
      if (res.pass) {
        breakout(res);
      }
    }) ?? ruleReturn.failing
  );
}
