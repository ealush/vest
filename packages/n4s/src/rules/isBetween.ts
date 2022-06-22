import { bindNot } from 'vest-utils';

import { greaterThanOrEquals as gte } from 'greaterThanOrEquals';
import { lessThanOrEquals as lte } from 'lessThanOrEquals';

export function isBetween(
  value: number | string,
  min: number | string,
  max: number | string
): boolean {
  return gte(value, min) && lte(value, max);
}

export const isNotBetween = bindNot(isBetween);
