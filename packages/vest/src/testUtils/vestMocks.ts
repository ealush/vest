import { genTestIsolate } from 'vestjs-runtime/test-utils';

import {
  IsolateTestBase,
  IsolateTestPayload,
  TIsolateTest,
  setIsolateTestValueOf,
} from 'IsolateTest';
import { VestIsolateType } from 'VestIsolateType';

export function mockIsolateTest(
  payload: Partial<IsolateTestPayload> = {}
): TIsolateTest {
  const isolate = genTestIsolate({
    ...IsolateTestBase(),
    testFn: jest.fn(),
    ...payload,
    type: VestIsolateType.Test,
  }) as TIsolateTest;
  setIsolateTestValueOf(isolate);

  return isolate;
}
