/**
 * Module: `src/rules/string/doesNotEndWith.ts`.
 *
 * Provides `doesNotEndWith`-related runtime and type utilities used by `n4s`.
 */
import { endsWith } from './endsWith';

// Checks if string does not end with the given suffix
export function doesNotEndWith(str: string, ending: string): boolean {
  return !endsWith(str, ending);
}
