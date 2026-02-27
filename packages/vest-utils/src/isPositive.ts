/**
 * Module: `src/isPositive.ts`.
 *
 * Provides `isPositive`-related runtime and type utilities used by `vest-utils`.
 */
import { greaterThan } from './greaterThan';

export function isPositive(value: number | string): boolean {
  return greaterThan(value, 0);
}
