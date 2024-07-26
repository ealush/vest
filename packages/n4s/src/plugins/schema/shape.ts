import { hasOwnProperty } from 'vest-utils';

import { loose } from './loose';
import { ShapeObject } from './schemaTypes';

import type { RuleDetailedResult } from '@/lib/ruleReturn';
import * as ruleReturn from '@/lib/ruleReturn';

export function shape(
  inputObject: Record<string, any>,
  shapeObject: ShapeObject,
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
