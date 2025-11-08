import run from 'runAnyoneMethods';

/**
 * Checks that at least one passed argument evaluates to a truthy value.
 */
export default function any(...args: unknown[]): boolean {
  return args.some(run);
}
