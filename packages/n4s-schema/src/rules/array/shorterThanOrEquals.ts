import { shorterThanOrEquals as shorterThanOrEqualsCommon } from 'commonLength';

export function shorterThanOrEquals(arr: any[], n: number): boolean {
  return Array.isArray(arr) && shorterThanOrEqualsCommon(arr, n);
}
