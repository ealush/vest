import { Isolate, IsolateTypes } from 'IsolateTypes';
import { CB } from 'vest-utils';

import { SuiteContext, useIsolate } from 'SuiteContext';
import { createIsolate } from 'createIsolate';

export function isolate<Callback extends CB = CB>(
  type: IsolateTypes,
  callback: Callback,
  data?: any
): [Isolate, ReturnType<Callback>] {
  const parent = useIsolate();

  const current = createIsolate(type, data);

  if (parent) {
    parent.children[parent.cursor] = current;
    parent.nextCursor();
  }

  const output = SuiteContext.run(
    {
      isolate: current,
    },
    callback
  ) as ReturnType<Callback>;

  return [current, output];
}
