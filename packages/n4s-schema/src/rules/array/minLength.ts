import { minLength as minLengthCommon } from 'commonLength';

export function minLength(arr: any[], n: number): boolean {
  return Array.isArray(arr) && minLengthCommon(arr, n);
}
