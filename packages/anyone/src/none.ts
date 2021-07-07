import bindNot from 'bindNot';

import run from 'runAnyoneMethods';

/**
 * Checks that at none of the passed arguments evaluate to a truthy value.
 */
export default function none(...args: any[]): boolean {
  return args.every(bindNot(run));
}
