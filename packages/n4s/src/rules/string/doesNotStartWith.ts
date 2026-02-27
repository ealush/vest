/**
 * Module: `src/rules/string/doesNotStartWith.ts`.
 *
 * Provides `doesNotStartWith`-related runtime and type utilities used by `n4s`.
 */
import { startsWith } from './startsWith';

// Checks if string does not start with the given prefix
export function doesNotStartWith(str: string, start: string): boolean {
  return !startsWith(str, start);
}
