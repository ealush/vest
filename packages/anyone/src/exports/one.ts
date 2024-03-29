import run from 'runAnyoneMethods';

/**
 * Checks that at only one passed argument evaluates to a truthy value.
 */
export default function one(...args: unknown[]): boolean {
  let count = 0;

  for (let i = 0; i < args.length; i++) {
    if (run(args[i])) {
      count++;
    }

    if (count > 1) {
      return false;
    }
  }

  return count === 1;
}
