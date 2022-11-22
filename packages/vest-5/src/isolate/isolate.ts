/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Isolate, IsolateTypes } from 'IsolateTypes';
import { CB } from 'vest-utils';

import { SuiteContext, useIsolate } from 'SuiteContext';
import { createIsolate } from 'createIsolate';

export function isolate(type: IsolateTypes, callback: CB, data?: any): Isolate {
  const parent = useIsolate();

  const current = createIsolate(type, data);

  if (parent) {
    parent.children[parent.cursor++] = current;
  }

  SuiteContext.run(
    {
      isolate: current,
    },
    callback
  );

  return current;
}
