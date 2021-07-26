import { ctx } from 'enforceContext';
import type { TLazy } from 'genEnforceLazy';
import type { TRuleDetailedResult } from 'ruleReturn';
import * as ruleReturn from 'ruleReturn';
import runLazyRule from 'runLazyRule';

export default function loose(
  inputObject: Record<string, any>,
  shapeObject: Record<string, TLazy>
): TRuleDetailedResult {
  for (const key in shapeObject) {
    const currentValue = inputObject[key];
    const currentRule = shapeObject[key];

    const res = ctx.run({ value: currentValue, set: true, meta: { key } }, () =>
      runLazyRule(currentRule, currentValue)
    );

    if (!res.pass) {
      return res;
    }
  }

  return ruleReturn.passing();
}
