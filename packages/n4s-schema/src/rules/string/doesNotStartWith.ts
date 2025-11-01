import { startsWith } from 'startsWith';

export function doesNotStartWith(str: string, start: string): boolean {
  return !startsWith(str, start);
}
