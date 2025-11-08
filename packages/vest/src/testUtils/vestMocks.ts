import { genTestIsolate } from 'vestjs-runtime/test-utils';

import { IsolateTestBase, IsolateTestPayload, TIsolateTest } from 'IsolateTest';
import { VestIsolateType } from 'VestIsolateType';

export function mockIsolateTest(
  payload: Partial<IsolateTestPayload> = {},
): TIsolateTest {
  const isolate = genTestIsolate({
    ...IsolateTestBase(),
    testFn: vi.fn(),
    ...payload,
    type: VestIsolateType.Test,
  }) as TIsolateTest;

  return isolate;
}
