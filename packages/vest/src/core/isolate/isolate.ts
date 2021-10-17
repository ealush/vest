import isFunction from 'isFunction';
import * as nestedArray from 'nestedArray';

import { IsolateTypes } from 'IsolateTypes';
import VestTest from 'VestTest';
import ctx from 'ctx';
import { useSetTests } from 'stateHooks';
import * as testCursor from 'testCursor';

export function isolate(
  { type = IsolateTypes.DEFAULT }: { type?: IsolateTypes },
  callback: () => VestTest[] | void
): VestTest[] | void {
  if (!isFunction(callback)) {
    return;
  }

  const path = testCursor.usePath();
  return ctx.run({ isolate: { type } }, () => {
    testCursor.addLevel();

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
