import { ctx } from 'n4s';

import { ShapeObject } from './schemaTypes';

import type { RuleDetailedResult } from '@/lib/ruleReturn';
import * as ruleReturn from '@/lib/ruleReturn';
import runLazyRule from '@/lib/runLazyRule';

export function loose(
  inputObject: Record<string, any>,
  shapeObject: ShapeObject,
): RuleDetailedResult {
  for (const key in shapeObject) {
    const currentValue = inputObject[key];
    const currentRule = shapeObject[key];

    const res = ctx.run({ value: currentValue, set: true, meta: { key } }, () =>
      runLazyRule(currentRule, currentValue),
    );

    if (!res.pass) {
      return res;
    }
  }

  return ruleReturn.passing();
}
