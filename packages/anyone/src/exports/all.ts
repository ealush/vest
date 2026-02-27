/**
 * Module: `src/exports/all.ts`.
 *
 * Provides `all`-related runtime and type utilities used by `anyone`.
 */
import run from '../runner/runAnyoneMethods';

/**
 * Checks that at all passed arguments evaluate to a truthy value.
 */
export default function all(...args: unknown[]): boolean {
  return args.every(run);
}
