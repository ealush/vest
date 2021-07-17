import run from 'runAnyoneMethods';

/**
 * Checks that at all passed arguments evaluate to a truthy value.
 */
export default function all(...args: unknown[]): boolean {
  return args.every(run);
}
