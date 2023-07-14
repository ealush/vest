import { noop, seq } from 'vest-utils';
import { genTestIsolate } from 'vestjs-runtime/test-utils';

import { IsolateTestPayload, TIsolateTest } from 'IsolateTest';
import { TestStatus } from 'IsolateTestStateMachine';
import { TestSeverity } from 'Severity';

export function mockIsolateTest(
  payload: Partial<IsolateTestPayload> = {}
): TIsolateTest {
  return genTestIsolate({
    id: seq(),
    severity: TestSeverity.Error,
    status: TestStatus.UNTESTED,
    testFn: noop,
    ...payload,
  }) as TIsolateTest;
}
