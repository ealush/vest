import run from 'runAnyoneMethods';

/**
 * Checks that at all passed arguments evaluate to a truthy value.
 */
export default function all(...args: any[]): boolean {
  return args.every(run);
}
