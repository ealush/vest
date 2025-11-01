import { maxLength as maxLengthCommon } from '../commonLength';

export function maxLength(arr: any[], n: number): boolean {
  return Array.isArray(arr) && maxLengthCommon(arr, n);
}
