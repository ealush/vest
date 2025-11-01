import { numberNotEquals as numberNotEqualsValue } from 'vest-utils';

export function numberNotEquals(value: number, n: number | string): boolean {
  return numberNotEqualsValue(value, n as any);
}
