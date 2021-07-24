import type { TRuleDetailedResult, TLazyRuleMethods } from 'ruleReturn';
import * as ruleReturn from 'ruleReturn';
import runLazyRule from 'runLazyRule';

export default function loose(
  inputObject: Record<string, any>,
  shapeObject: Record<string, TLazyRuleMethods>
): TRuleDetailedResult {
  for (const key in shapeObject) {
    const currentValue = inputObject[key];
    const currentRule = shapeObject[key];

    const res = runLazyRule(currentRule, currentValue);

    if (!res.pass) {
      return res;
    }
  }

  return ruleReturn.passing();
}
