import { makeResult, Result } from 'vest-utils';

import { TIsolateTest } from './IsolateTest';
import { VestTest } from './VestTest';
import { isSameProfileTest } from './isSameProfileTest';

export default function cancelOverriddenPendingTest(
  prevRunTestObject: TIsolateTest,
  currentRunTestObject: TIsolateTest,
): Result<void> {
  if (
    currentRunTestObject !== prevRunTestObject &&
    isSameProfileTest(prevRunTestObject, currentRunTestObject).unwrap() &&
    VestTest.isPending(prevRunTestObject)
  ) {
    VestTest.cancel(prevRunTestObject);
  }
  return makeResult.Ok(undefined);
}
