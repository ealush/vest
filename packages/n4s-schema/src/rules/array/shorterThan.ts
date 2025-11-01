import { shorterThan as shorterThanCommon } from '../commonLength';

export function shorterThan(arr: any[], n: number): boolean {
  return Array.isArray(arr) && shorterThanCommon(arr, n);
}
