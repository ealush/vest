import invariant from 'invariant';
import isFunction from 'isFunction';
import * as nestedArray from 'nestedArray';

import { createIsolateCursor } from './isolateCursor';

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

  const isolate = generateIsolate(type, useCurrentPath());

  const output = ctx.run({ isolate }, () => {
    isolate.keys.prev = usePrevKeys();

    useSetTests(tests => nestedArray.setValueAtPath(tests, isolate.path, []));

    const res = callback();
    return res;
  });

  parent.cursor.next();

  return output;
}

export function useIsolate(): Isolate {
  return ctx.useX().isolate;
}

export function shouldAllowReorder() {
  return ctx.useX().isolate.type === IsolateTypes.EACH;
}

export function useCurrentPath(): number[] {
  const isolate = useIsolate();
  return isolate.path.concat(isolate.cursor.current());
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
