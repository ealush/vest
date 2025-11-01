import { lengthEquals as lengthEqualsCommon } from '../commonLength';

export function lengthEquals(arr: any[], n: number): boolean {
  return Array.isArray(arr) && lengthEqualsCommon(arr, n);
}
