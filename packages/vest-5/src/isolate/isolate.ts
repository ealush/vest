/* eslint-disable @typescript-eslint/ban-ts-comment */
import { SuiteRuntimeContext, SuiteRuntimeRootContext, useIsolate } from 'ctx';
import { CB } from 'vest-utils';

import { createIsolate } from 'createIsolate';
import { Isolate, IsolateTypes } from 'isolateTypes';

export function isolate(type: IsolateTypes, callback: CB, data?: any): Isolate {
  const parent = useIsolate();

  const current = createIsolate(type, data);

  if (parent) {
    parent.children[parent.cursor++] = current;
    SuiteRuntimeContext.run(current, callback);
  } else {
    SuiteRuntimeRootContext.run(current, () => {
      SuiteRuntimeContext.run(current, callback);
    });
  }

  return current;
}
