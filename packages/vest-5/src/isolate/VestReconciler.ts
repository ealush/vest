import { isOptionalFiedApplied } from 'optional';

import { Isolate, IsolateTypes } from 'IsolateTypes';
import { VestTest } from 'VestTest';
import cancelOverriddenPendingTest from 'cancelOverriddenPendingTest';
import { isExcluded } from 'exclusive';
import { shouldSkipBasedOnMode } from 'mode';
import { withinActiveOmitWhen } from 'omitWhen';
import { isExcludedIndividually } from 'skipWhen';

// eslint-disable-next-line max-statements, complexity
export function VestReconciler(
  historyNode: Isolate | null,
  current: Isolate
): boolean {
  if (current.type !== IsolateTypes.TEST) {
    return false;
  }

  if (!historyNode) {
    return false;
  }

  const currentTestObject = getIsolateTest(current);

  if (shouldSkipBasedOnMode(currentTestObject)) {
    currentTestObject.skip();
    return false;
  }
  const prevTestObject = getIsolateTest(historyNode);

  if (
    withinActiveOmitWhen() ||
    isOptionalFiedApplied(currentTestObject.fieldName)
  ) {
    prevTestObject.omit();
    return false;
  }

  if (isExcluded(currentTestObject)) {
    // We're forcing skipping the pending test
    // if we're directly within a skipWhen block
    // This mostly means that we're probably giving
    // up on this async test intentionally.
    prevTestObject.skip(isExcludedIndividually());
  }

  cancelOverriddenPendingTest(prevTestObject, currentTestObject);

  return false;
}

function getIsolateTest(isolate: Isolate): VestTest {
  return isolate.data;
}
