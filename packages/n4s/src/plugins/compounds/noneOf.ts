import mapFirst from 'mapFirst';

import type { Lazy } from 'genEnforceLazy';
import type { RuleDetailedResult } from 'ruleReturn';
import * as ruleReturn from 'ruleReturn';
import runLazyRule from 'runLazyRule';

export function noneOf(value: unknown, ...rules: Lazy[]): RuleDetailedResult {
  return ruleReturn.defaultToPassing(
    mapFirst(rules, (rule, breakout) => {
      const res = runLazyRule(rule, value);

      if (res.pass) {
        breakout(ruleReturn.failing());
      }
    })
  );
}
