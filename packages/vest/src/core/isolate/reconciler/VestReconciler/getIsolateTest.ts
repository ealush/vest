import { invariant } from 'vest-utils';

import { Isolate } from 'IsolateTypes';
import { VestTest } from 'VestTest';

export function getIsolateTestX(isolate: Isolate): VestTest {
  invariant(isolate.data);
  return isolate.data;
}
export function getIsolateTest(isolate: Isolate): VestTest | undefined {
  return isolate.data;
}
