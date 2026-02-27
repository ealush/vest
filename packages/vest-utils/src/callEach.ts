/**
 * Module: `src/callEach.ts`.
 *
 * Provides `callEach`-related runtime and type utilities used by `vest-utils`.
 */
import type { CB } from './utilityTypes';

export default function callEach(arr: CB[]): void {
  return arr.forEach(fn => fn());
}
