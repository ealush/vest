import { isOptionalFiedApplied } from 'optional';

import { IsolateTest } from 'IsolateTest';
import { isExcluded } from 'exclusive';
import { shouldSkipBasedOnMode } from 'mode';
import { withinActiveOmitWhen } from 'omitWhen';
import { isExcludedIndividually } from 'skipWhen';

export function verifyTestRun(
  testObject: IsolateTest,
  collisionResult: IsolateTest = testObject
): IsolateTest {
  if (shouldSkipBasedOnMode(testObject)) {
    return skipTestAndReturn(testObject);
  }

  if (shouldOmit(testObject)) {
    return omitTestAndReturn(testObject);
  }

  if (isExcluded(testObject)) {
    return forceSkipIfInSkipWhen(collisionResult);
  }

  return testObject;
}

export function shouldOmit(testObject: IsolateTest): boolean {
  return withinActiveOmitWhen() || isOptionalFiedApplied(testObject.fieldName);
}

export function skipTestAndReturn(testNode: IsolateTest): IsolateTest {
  testNode.skip();
  return testNode;
}

export function omitTestAndReturn(testNode: IsolateTest): IsolateTest {
  testNode.omit();
  return testNode;
}

export function forceSkipIfInSkipWhen(testNode: IsolateTest): IsolateTest {
  // We're forcing skipping the pending test
  // if we're directly within a skipWhen block
  // This mostly means that we're probably giving
  // up on this async test intentionally.
  testNode.skip(isExcludedIndividually());
  return testNode;
}
