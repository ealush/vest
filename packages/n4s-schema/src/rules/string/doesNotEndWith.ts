import { endsWith } from 'endsWith';

export function doesNotEndWith(str: string, ending: string): boolean {
  return !endsWith(str, ending);
}
