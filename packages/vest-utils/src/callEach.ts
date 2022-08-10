import type { CB } from 'utilityTypes';

export default function callEach(arr: CB[]): void {
  return arr.forEach(fn => fn());
}
