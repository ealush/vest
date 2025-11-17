import { startsWith } from './startsWith';

// Checks if string does not start with the given prefix
export function doesNotStartWith(str: string, start: string): boolean {
  return !startsWith(str, start);
}
