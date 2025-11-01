import { lengthNotEquals as lengthNotEqualsCommon } from '../commonLength';

export function lengthNotEquals(arr: any[], n: number): boolean {
  return Array.isArray(arr) && lengthNotEqualsCommon(arr, n);
}
