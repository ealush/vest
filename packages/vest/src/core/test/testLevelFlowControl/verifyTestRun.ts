import { useIsOptionalFiedApplied } from 'optional';

import { TIsolateTest } from 'IsolateTest';
import { TFieldName } from 'SuiteResultTypes';
import { VestTest } from 'VestTest';
import { useShouldSkipBasedOnMode } from 'mode';
import { useWithinActiveOmitWhen } from 'omitWhen';
import { useIsExcludedIndividually } from 'skipWhen';
import { useIsExcluded } from 'useIsExcluded';

export function useVerifyTestRun(
  testObject: TIsolateTest,
  collisionResult: TIsolateTest = testObject
): TIsolateTest {
  const testData = VestTest.getData(testObject);

  if (useShouldSkipBasedOnMode(testData)) {
    return skipTestAndReturn(testObject);
  }

  if (useShouldOmit(testData.fieldName)) {
    return omitTestAndReturn(testObject);
  }

  if (useIsExcluded(testObject)) {
    return useForceSkipIfInSkipWhen(collisionResult);
  }

  return testObject;
}

function useShouldOmit(fieldName: TFieldName): boolean {
  return useWithinActiveOmitWhen() || useIsOptionalFiedApplied(fieldName);
}

function skipTestAndReturn(testNode: TIsolateTest): TIsolateTest {
  VestTest.skip(testNode);
  return testNode;
}

function omitTestAndReturn(testNode: TIsolateTest): TIsolateTest {
  VestTest.omit(testNode);
  return testNode;
}

function useForceSkipIfInSkipWhen(testNode: TIsolateTest): TIsolateTest {
  // We're forcing skipping the pending test
  // if we're directly within a skipWhen block
  // This mostly means that we're probably giving
  // up on this async test intentionally.
  VestTest.skip(testNode, useIsExcludedIndividually());
  return testNode;
}
