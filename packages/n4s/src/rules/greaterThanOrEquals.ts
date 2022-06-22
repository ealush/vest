import { greaterThan, numberEquals } from 'vest-utils';

export function greaterThanOrEquals(
  value: string | number,
  gte: string | number
): boolean {
  return numberEquals(value, gte) || greaterThan(value, gte);
}
