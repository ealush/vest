import { invariant } from 'vest-utils';

import { VestTest } from 'VestTest';
import { Isolate } from 'isolate';

export function getIsolateTestX(isolate: Isolate): VestTest {
  invariant(isolate.data);
  return isolate.data;
}
export function getIsolateTest(isolate: Isolate): VestTest | undefined {
  return isolate.data;
}
