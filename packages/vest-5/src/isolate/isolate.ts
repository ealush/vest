/* eslint-disable @typescript-eslint/ban-ts-comment */
import { suiteRuntime, useIsolate } from 'ctx';

import { createIsolate } from 'createIsolate';
import { IsolateTypes } from 'isolateTypes';

export function isolate<T>(type: IsolateTypes, callback: IsolateCb<T>): T {
  const parent = useIsolate();

  const child = createIsolate<T>(type);

  if (parent) {
    parent.children[parent.cursor++] = child;
  }

  return suiteRuntime.run<T>(child, () => {
    const result = callback();

    return result;
  });
}

type IsolateCb<T> = (...args: any[]) => T;
