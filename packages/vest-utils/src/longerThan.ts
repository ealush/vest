/**
 * Module: `src/longerThan.ts`.
 *
 * Provides `longerThan`-related runtime and type utilities used by `vest-utils`.
 */
import { greaterThan } from './greaterThan';

export function longerThan(
  value: string | unknown[],
  arg1: string | number,
): boolean {
  return greaterThan(value.length, arg1);
}
