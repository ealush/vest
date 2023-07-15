import { genTestIsolate } from 'vestjs-runtime/test-utils';

import { IsolateTestBase, IsolateTestData, TIsolateTest } from 'IsolateTest';
import { VestIsolateType } from 'VestIsolateType';

export function mockIsolateTest(
  data: Partial<IsolateTestData> = {}
): TIsolateTest {
  const isolate = genTestIsolate({
    ...IsolateTestBase(),
    data,
    testFn: jest.fn(),
    type: VestIsolateType.Test,
  }) as TIsolateTest;

  return isolate;
}
