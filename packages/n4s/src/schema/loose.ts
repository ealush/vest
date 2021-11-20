import type { IShapeObject } from 'genEnforceLazy';
import { ctx } from 'n4s';
import type { TRuleDetailedResult } from 'ruleReturn';
import * as ruleReturn from 'ruleReturn';
import runLazyRule from 'runLazyRule';

export function loose(
  inputObject: Record<string, any>,
  shapeObject: IShapeObject
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
