import { nestedArray, invariant, isFunction } from 'vest-utils';

import { IsolateTypes } from 'IsolateTypes';
import VestTest from 'VestTest';
import ctx from 'ctx';
import { generateIsolate } from 'generateIsolate';
import { useCurrentPath, useCursor, useIsolate } from 'isolateHooks';
import { usePrevKeys } from 'key';
import { useSetTests } from 'stateHooks';

export function isolate(
  { type = IsolateTypes.DEFAULT }: { type?: IsolateTypes },
  callback: () => VestTest[] | void
): VestTest[] | void {
  invariant(isFunction(callback));

  // Generate a new Isolate layer, with its own cursor
  const isolate = generateIsolate(type, useCurrentPath());

  const output = ctx.run({ isolate }, () => {
    isolate.keys.prev = usePrevKeys();

    useSetTests(tests => nestedArray.setValueAtPath(tests, isolate.path, []));

    const res = callback();
    return res;
  });

  // Move the parent cursor forward once we're done
  useCursor().next();

  return output;
}

/**
 * @returns {boolean} Whether or not the current isolate allows tests to be reordered
 */
export function shouldAllowReorder(): boolean {
  return useIsolate().type === IsolateTypes.EACH;
}
