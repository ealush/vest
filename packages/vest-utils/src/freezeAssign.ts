/**
 * Module: `src/freezeAssign.ts`.
 *
 * Provides `freezeAssign`-related runtime and type utilities used by `vest-utils`.
 */
import assign from './assign';

export function freezeAssign<T extends object>(...args: Partial<T>[]): T {
  return Object.freeze(assign(...(args as [Partial<T>])));
}
