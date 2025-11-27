import { makeResult, Result } from 'vest-utils';

import { useIsExcluded } from '../../../hooks/focused/useIsExcluded';
import { useShouldSkipBasedOnMode } from '../../../hooks/optional/mode';
import { useIsOptionalFieldApplied } from '../../../hooks/optional/optional';
import { useWithinActiveOmitWhen } from '../../../isolates/omitWhen';
import { useIsExcludedIndividually } from '../../../isolates/skipWhen';
import { TFieldName } from '../../../suiteResult/SuiteResultTypes';
import { TIsolateTest } from '../../isolate/IsolateTest/IsolateTest';
import { VestTest } from '../../isolate/IsolateTest/VestTest';

export function useVerifyTestRun(
  testObject: TIsolateTest,
  collisionResult: TIsolateTest = testObject,
): TIsolateTest {
  const testData = VestTest.getData(testObject);

  if (useShouldSkipBasedOnMode(testData)) {
    return skipTestAndReturn(testObject).unwrap();
  }

  if (useShouldOmit(testData.fieldName)) {
    return omitTestAndReturn(testObject).unwrap();
  }

  if (useIsExcluded(testObject)) {
    return useForceSkipIfInSkipWhen(collisionResult).unwrap();
  }

  return testObject;
}

function useShouldOmit(fieldName: TFieldName): boolean {
  return useWithinActiveOmitWhen() || useIsOptionalFieldApplied(fieldName);
}

function skipTestAndReturn(testNode: TIsolateTest): Result<TIsolateTest> {
  VestTest.skip(testNode);
  return makeResult.Ok(testNode);
}

function omitTestAndReturn(testNode: TIsolateTest): Result<TIsolateTest> {
  VestTest.omit(testNode);
  return makeResult.Ok(testNode);
}

function useForceSkipIfInSkipWhen(
  testNode: TIsolateTest,
): Result<TIsolateTest> {
  // We're forcing skipping the pending test
  // if we're directly within a skipWhen block
  // This mostly means that we're probably giving
  // up on this async test intentionally.
  VestTest.skip(testNode, useIsExcludedIndividually());
  return makeResult.Ok(testNode);
}
