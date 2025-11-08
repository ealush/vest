import { bindNot } from 'vest-utils';

import run from 'runAnyoneMethods';

/**
 * Checks that at none of the passed arguments evaluate to a truthy value.
 */
export default function none(...args: unknown[]): boolean {
  return args.every(bindNot(run));
}
