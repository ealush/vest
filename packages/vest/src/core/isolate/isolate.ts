import invariant from 'invariant';
import isFunction from 'isFunction';
import * as nestedArray from 'nestedArray';

import { IsolateCursor } from './isolateCursor';

import { Isolate, IsolateTypes } from 'IsolateTypes';
import VestTest from 'VestTest';
import ctx from 'ctx';
import { generateIsolate } from 'generateIsolate';
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
 * @returns {Isolate} The current isolate layer
 */
export function useIsolate(): Isolate {
  return ctx.useX().isolate;
}

/**
 * @returns {boolean} Whether or not the current isolate allows tests to be reordered
 */
export function disallowReorder(): boolean {
  return useIsolate().type !== IsolateTypes.EACH;
}

/**
 * @returns {number[]} The current cursor path of the isolate tree
 */
export function useCurrentPath(): number[] {
  const isolate = useIsolate();
  return isolate.path.concat(isolate.cursor.current());
}

/**
 * @returns {IsolateCursor} The cursor object for the current isolate
 */
export function useCursor(): IsolateCursor {
  return useIsolate().cursor;
}
