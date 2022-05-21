import invariant from 'invariant';
import isFunction from 'isFunction';
import * as nestedArray from 'nestedArray';

import { createIsolateCursor, IsolateCursor } from './isolateCursor';

import { Isolate, IsolateTypes } from 'IsolateTypes';
import VestTest from 'VestTest';
import ctx from 'ctx';
import { usePrevKeys } from 'key';
import { useSetTests } from 'stateHooks';

export function isolate(
  { type = IsolateTypes.DEFAULT }: { type?: IsolateTypes },
  callback: () => VestTest[] | void
): VestTest[] | void {
  invariant(isFunction(callback));

  const parent = useIsolate();

  // Generate a new Isolate layer, with its own cursor
  const isolate = generateIsolate(type, useCurrentPath(), parent);

  console.log('---------------entering isolate-------------', isolate.type);
  const output = ctx.run({ isolate }, () => {
    isolate.keys.prev = usePrevKeys();

    useSetTests(tests => nestedArray.setValueAtPath(tests, isolate.path, []));
    parent.tests.current[useCursor().current()] = isolate.tests.current;

    const res = callback();
    console.log('------isolate path:', isolate.path);
    console.log(
      '-----------------exiting isolate----------------',
      isolate.type
    );
    return res;
  });

  console.log(
    '++++++++++++incrementing cursor++++++++++++++++++ cur:',
    useCursor().current()
  );
  // Move the parent cursor forward once we're done
  useCursor().next();
  console.log(
    '++++++++++++incremented cursor++++++++++++++++++ new:',
    useCursor().current()
  );

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
export function shouldAllowReorder(): boolean {
  return ctx.useX().isolate.type === IsolateTypes.EACH;
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

export function generateIsolate(
  type: IsolateTypes,
  path: number[] = [],
  parent: Isolate | null = null
): Isolate {
  const current = [];
  const rootTests = parent ? parent.tests.root.current : current;
  return {
    cursor: createIsolateCursor(),
    keys: {
      current: {},
      prev: {},
    },
    parent,
    path,
    tests: {
      root: {
        current: rootTests,
      },
      current,
    },
    type,
  };
}
