import { useIsOptionalFiedApplied } from 'optional';

import { IsolateTest } from 'IsolateTest';
import { useIsExcluded } from 'exclusive';
import { useShouldSkipBasedOnMode } from 'mode';
import { useWithinActiveOmitWhen } from 'omitWhen';
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

export function useShouldOmit(testObject: IsolateTest): boolean {
  return (
    useWithinActiveOmitWhen() || useIsOptionalFiedApplied(testObject.fieldName)
  );
}

export function skipTestAndReturn(testNode: IsolateTest): IsolateTest {
  testNode.skip();
  return testNode;
}

export function omitTestAndReturn(testNode: IsolateTest): IsolateTest {
  testNode.omit();
  return testNode;
}

export function useForceSkipIfInSkipWhen(testNode: IsolateTest): IsolateTest {
  // We're forcing skipping the pending test
  // if we're directly within a skipWhen block
  // This mostly means that we're probably giving
  // up on this async test intentionally.
  testNode.skip(useIsExcludedIndividually());
  return testNode;
}
