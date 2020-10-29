import bindNot from 'bindNot';
import { greaterThanOrEquals as gte } from 'greaterThanOrEquals';
import { lessThanOrEquals as lte } from 'lessThanOrEquals';

export function isBetween(value, min, max) {
  return gte(value, min) && lte(value, max);
}

export const isNotBetween = bindNot(isBetween);

export default isBetween;
