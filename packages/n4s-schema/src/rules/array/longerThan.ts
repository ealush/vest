import { longerThan as longerThanCommon } from '../commonLength';

export function longerThan(arr: any[], n: number): boolean {
  return Array.isArray(arr) && longerThanCommon(arr, n);
}
