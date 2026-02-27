/**
 * Module: `src/core/isolate/IsolateTest/cancelOverriddenPendingTest.ts`.
 *
 * Provides `cancelOverriddenPendingTest`-related runtime and type utilities used by `vest`.
 */
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
    VestTest.isStartedStatus(prevRunTestObject)
  ) {
    VestTest.cancel(prevRunTestObject);
  }
  return makeResult.Ok(undefined);
}
