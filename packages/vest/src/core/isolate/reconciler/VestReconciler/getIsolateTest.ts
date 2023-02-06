import { invariant } from 'vest-utils';

import { IsolateTest } from 'IsolateTest';
import { Isolate } from 'isolate';

export function getIsolateTestX(isolate: Isolate): IsolateTest {
  invariant(IsolateTest.is(isolate));
  return isolate;
}
export function getIsolateTest(
  isolate: Isolate
): undefined | IsolateTest | undefined {
  if (IsolateTest.is(isolate)) {
    return isolate;
  }
}
