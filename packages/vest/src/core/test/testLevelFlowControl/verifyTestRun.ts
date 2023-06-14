
import { IsolateTest } from 'IsolateTest';
import { VestTestMutator } from 'VestTestMutator';
import { useIsExcluded } from 'exclusive';
import { useShouldSkipBasedOnMode } from 'mode';
import { useWithinActiveOmitWhen } from 'omitWhen';
import { useIsOptionalFiedApplied } from 'optional';
import { useIsExcludedIndividually } from 'skipWhen';

export function useVerifyTestRun(
  testObject: IsolateTest,
  collisionResult: IsolateTest = testObject
): IsolateTest {
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

function useShouldOmit(testObject: IsolateTest): boolean {
  return (
    useWithinActiveOmitWhen() || useIsOptionalFiedApplied(testObject.fieldName)
  );
}

function skipTestAndReturn(testNode: IsolateTest): IsolateTest {
  VestTestMutator.skip(testNode);
  return testNode;
}

function omitTestAndReturn(testNode: IsolateTest): IsolateTest {
  VestTestMutator.omit(testNode);
  return testNode;
}

function useForceSkipIfInSkipWhen(testNode: IsolateTest): IsolateTest {
  // We're forcing skipping the pending test
  // if we're directly within a skipWhen block
  // This mostly means that we're probably giving
  // up on this async test intentionally.
  VestTestMutator.skip(testNode, useIsExcludedIndividually());
  return testNode;
}
