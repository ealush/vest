import { bindNot } from 'vest-utils';

import { greaterThanOrEquals as gte } from './greaterThanOrEquals';
import { lessThanOrEquals as lte } from './lessThanOrEquals';

// Checks if numeric value is within the given range (inclusive)
export function isBetween(
  value: number | string,
  min: number | string,
  max: number | string,
): boolean {
  return gte(value, min) && lte(value, max);
}

export const isNotBetween = bindNot(isBetween);
