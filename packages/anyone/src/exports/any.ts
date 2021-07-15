import run from 'runAnyoneMethods';

/**
 * Checks that at least one passed argument evaluates to a truthy value.
 */
export default function any(...args: any[]): boolean {
  return args.some(run);
}
