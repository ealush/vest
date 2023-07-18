
import { useIsOptionalFiedApplied } from 'optional';

import { TIsolateTest } from 'IsolateTest';
import { VestTestMutator } from 'VestTestMutator';
import { useShouldSkipBasedOnMode } from 'mode';
import { useWithinActiveOmitWhen } from 'omitWhen';
import { useIsExcludedIndividually } from 'skipWhen';
import { useIsExcluded } from 'useIsExcluded';

export function useVerifyTestRun(
  testObject: TIsolateTest,
  collisionResult: TIsolateTest = testObject
): TIsolateTest {
  if (useShouldSkipBasedOnMode(testObject)) {
    return skipTestAndReturn(testObject);
  }

  if (useShouldOmit(testObject)) {
    return omitTestAndReturn(testObject);
  }

  if (useIsExcluded(testObject)) {
    return useForceSkipIfInSkipWhen(collisionResult);
  }

  return testObject;
}

function useShouldOmit(testObject: TIsolateTest): boolean {
  return (
    useWithinActiveOmitWhen() || useIsOptionalFiedApplied(testObject.fieldName)
  );
}

function skipTestAndReturn(testNode: TIsolateTest): TIsolateTest {
  VestTestMutator.skip(testNode);
  return testNode;
}

function omitTestAndReturn(testNode: TIsolateTest): TIsolateTest {
  VestTestMutator.omit(testNode);
  return testNode;
}

function useForceSkipIfInSkipWhen(testNode: TIsolateTest): TIsolateTest {
  // We're forcing skipping the pending test
  // if we're directly within a skipWhen block
  // This mostly means that we're probably giving
  // up on this async test intentionally.
  VestTestMutator.skip(testNode, useIsExcludedIndividually());
  return testNode;
}
