import { longerThanOrEquals as longerThanOrEqualsCommon } from 'commonLength';

export function longerThanOrEquals(arr: any[], n: number): boolean {
  return Array.isArray(arr) && longerThanOrEqualsCommon(arr, n);
}
