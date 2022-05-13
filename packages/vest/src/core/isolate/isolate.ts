import invariant from 'invariant';
import isFunction from 'isFunction';
import * as nestedArray from 'nestedArray';

import { createIsolateCursor } from './isolateCursor';

import { Isolate, IsolateTypes } from 'IsolateTypes';
import VestTest from 'VestTest';
import ctx from 'ctx';
import { usePrevKeys } from 'key';
import { useSetTests } from 'stateHooks';
import * as testCursor from 'testCursor';

export function isolate(
  { type = IsolateTypes.DEFAULT }: { type?: IsolateTypes },
  callback: () => VestTest[] | void
): VestTest[] | void {
  invariant(isFunction(callback));

  const next = generateIsolate(type);

  const path = testCursor.usePath();
  return ctx.run({ isolate: next }, () => {
    testCursor.addLevel();

    next.keys.prev = usePrevKeys();

    useSetTests(tests => nestedArray.setValueAtPath(tests, path, []));

    const res = callback();
    testCursor.removeLevel();
    testCursor.moveForward();
    return res;
  });
}

export function shouldAllowReorder() {
  return ctx.useX().isolate.type === IsolateTypes.EACH;
}

export function generateIsolate(
  type: IsolateTypes,
  path: number[] = []
): Isolate {
  return {
    cursor: createIsolateCursor(),
    keys: {
      current: {},
      prev: {},
    },
    path,
    type,
  };
}
