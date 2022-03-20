import { greaterThan } from 'greaterThan';
import { numberEquals } from 'numberEquals';

export function greaterThanOrEquals(
  value: string | number,
  gte: string | number
): boolean {
  return numberEquals(value, gte) || greaterThan(value, gte);
}
