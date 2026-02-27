/**
 * Module: `src/exports/any.ts`.
 *
 * Provides `any`-related runtime and type utilities used by `anyone`.
 */
import run from '../runner/runAnyoneMethods';

/**
 * Checks that at least one passed argument evaluates to a truthy value.
 */
export default function any(...args: unknown[]): boolean {
  return args.some(run);
}
