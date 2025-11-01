import { numberEquals as numberEqualsValue } from 'vest-utils';

export function numberEquals(value: number, n: number | string): boolean {
  return numberEqualsValue(value, n as any);
}
