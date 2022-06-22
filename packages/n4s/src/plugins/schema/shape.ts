import { hasOwnProperty } from 'vest-utils';

import { loose } from 'loose';
import type { RuleDetailedResult } from 'ruleReturn';
import * as ruleReturn from 'ruleReturn';
import type { ShapeObject } from 'schemaTypes';

export function shape(
  inputObject: Record<string, any>,
  shapeObject: ShapeObject
): RuleDetailedResult {
  const baseRes = loose(inputObject, shapeObject);
  if (!baseRes.pass) {
    return baseRes;
  }
  for (const key in inputObject) {
    if (!hasOwnProperty(shapeObject, key)) {
      return ruleReturn.failing();
    }
  }

  return ruleReturn.passing();
}
