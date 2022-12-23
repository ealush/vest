import { isOptionalFiedApplied } from 'optional';
import { isNullish } from 'vest-utils';

import { Isolate, IsolateTest } from 'IsolateTypes';
import { VestTest } from 'VestTest';
import cancelOverriddenPendingTest from 'cancelOverriddenPendingTest';
import { isExcluded } from 'exclusive';
import { getIsolateTest, getIsolateTestX } from 'getIsolateTest';
import { handleCollision } from 'handleCollision';
import { handleTestNodeWithKey } from 'handleTestNodeWithKey';
import { isTestIsolate } from 'isIsolateType';
import { shouldSkipBasedOnMode } from 'mode';
import { withinActiveOmitWhen } from 'omitWhen';
import { isExcludedIndividually } from 'skipWhen';
import { testHasKey } from 'testHasKey';

export function vestReconciler(
  historyNode: Isolate | null,
  currentNode: Isolate
): Isolate {
  // Start by verifying params
  if (!isTestIsolate(currentNode)) {
    return currentNode;
  }

  const testNode = currentNode as IsolateTest;

  if (isNullish(historyNode)) {
    return handleNoHistoryNode(testNode);
  }

  const prevTestObject = getIsolateTest(historyNode);

  if (isNullish(prevTestObject)) {
    return currentNode;
  }

  return vestReconcilerImplementation(historyNode as IsolateTest, testNode);
}
// eslint-disable-next-line max-statements
export function vestReconcilerImplementation(
  historyNode: IsolateTest,
  currentNode: IsolateTest
): Isolate {
  const currentTestObject = getIsolateTestX(currentNode);
  const prevTestObject = getIsolateTestX(historyNode);

  const collisionResult = handleCollision(currentNode, historyNode);

  if (shouldSkipBasedOnMode(currentTestObject)) {
    return skipTestAndReturn(currentNode);
  }

  if (shouldOmit(currentTestObject)) {
    return omitTestAndReturn(currentNode);
  }

  if (isExcluded(currentTestObject)) {
    return forceSkipIfInSkipWhen(collisionResult);
  }

  // TODO: This should probably happen everywhere we return the current node
  cancelOverriddenPendingTest(prevTestObject, currentTestObject);

  return currentNode;
}

function shouldOmit(testObject: VestTest): boolean {
  return withinActiveOmitWhen() || isOptionalFiedApplied(testObject.fieldName);
}

function handleNoHistoryNode(testNode: IsolateTest): IsolateTest {
  const testObject = getIsolateTestX(testNode);

  if (testHasKey(testObject)) {
    return handleTestNodeWithKey(testNode);
  }

  return testNode;
}

function skipTestAndReturn(testNode: IsolateTest): IsolateTest {
  const testObject = getIsolateTestX(testNode);

  testObject.skip();
  return testNode;
}

function omitTestAndReturn(testNode: IsolateTest): IsolateTest {
  const testObject = getIsolateTestX(testNode);

  testObject.omit();
  return testNode;
}

function forceSkipIfInSkipWhen(testNode: IsolateTest): IsolateTest {
  const collisionTestObject = getIsolateTestX(testNode);

  // We're forcing skipping the pending test
  // if we're directly within a skipWhen block
  // This mostly means that we're probably giving
  // up on this async test intentionally.
  collisionTestObject.skip(isExcludedIndividually());
  return testNode;
}
