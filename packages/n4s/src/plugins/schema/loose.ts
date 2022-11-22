import { ctx } from 'n4s';

import type { RuleDetailedResult } from 'ruleReturn';
import * as ruleReturn from 'ruleReturn';
import runLazyRule from 'runLazyRule';
import type { ShapeObject } from 'schemaTypes';

export function loose(
  inputObject: Record<string, any>,
  shapeObject: ShapeObject
): RuleDetailedResult {
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
