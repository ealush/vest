import invariant from 'invariant';
import isFunction from 'isFunction';
import * as nestedArray from 'nestedArray';

import { IsolateKeys, IsolateTypes } from 'IsolateTypes';
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

  const keys: IsolateKeys = {
    current: {},
    prev: {},
  };

  const path = testCursor.usePath();
  return ctx.run({ isolate: { type, keys } }, () => {
    testCursor.addLevel();

    keys.prev = usePrevKeys();

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
