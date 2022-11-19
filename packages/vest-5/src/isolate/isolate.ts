/* eslint-disable @typescript-eslint/ban-ts-comment */
import { suiteRuntime, useIsolate } from 'ctx';
import { CB } from 'vest-utils';

import { createIsolate } from 'createIsolate';
import { Isolate, IsolateTypes } from 'isolateTypes';

export function isolate<T = unknown>(
  type: IsolateTypes,
  callback: CB,
  data?: T
): Isolate<T> {
  const parent = useIsolate();

  const current = createIsolate<T>(type, data);

  if (parent) {
    parent.children[parent.cursor++] = current;
  }

  suiteRuntime.run<T>(current, callback);

  return current;
}
