import { Isolate, IsolateTypes } from 'IsolateTypes';
import { VestTest } from 'VestTest';
import cancelOverriddenPendingTest from 'cancelOverriddenPendingTest';
import { isExcluded } from 'exclusive';
import { isSameProfileTest } from 'isSameProfileTest';
import { shouldSkipBasedOnMode } from 'mode';
import { withinActiveOmitWhen } from 'omitWhen';
import { isOptionalFiedApplied } from 'optional';
import { isExcludedIndividually } from 'skipWhen';
import { deferThrow, invariant, isNotEmpty, isNullish } from 'vest-utils';

import { useSetIsolateKey, useIsolate } from 'IsolateContext';
import { useHistoryKeyValue, useHistoryNode } from 'PersistedContext';

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
  const prevTestObject = getIsolateTest(historyNode);

  handleCollision(currentTestObject, prevTestObject);

  if (shouldSkipBasedOnMode(currentTestObject)) {
    currentTestObject.skip();
    return false;
  }

  if (
    withinActiveOmitWhen() ||
    isOptionalFiedApplied(currentTestObject.fieldName)
  ) {
    prevTestObject.omit();
    return true;
  }

  if (isExcluded(currentTestObject)) {
    // We're forcing skipping the pending test
    // if we're directly within a skipWhen block
    // This mostly means that we're probably giving
    // up on this async test intentionally.
    prevTestObject.skip(isExcludedIndividually());
    return true;
  }

  // We actually get to run our tests:
  cancelOverriddenPendingTest(prevTestObject, currentTestObject);

  return false;
}

function getIsolateTest(isolate: Isolate): VestTest {
  return isolate.data;
}

function handleCollision(
  newTestObject: VestTest,
  prevTestObject: VestTest
): VestTest {
  if (!isNullish(newTestObject.key)) {
    return handleKeyTest(newTestObject);
  }

  if (testReorderDetected(newTestObject, prevTestObject)) {
    throwTestOrderError(prevTestObject, newTestObject);
    removeAllNextTestsInIsolate();
  }

  return newTestObject;
}

function throwTestOrderError(
  prevTest: VestTest,
  newTestObject: VestTest
): void {
  if (shouldAllowReorder()) {
    return;
  }

  deferThrow(`Vest Critical Error: Tests called in different order than previous run.
    expected: ${prevTest.fieldName}
    received: ${newTestObject.fieldName}
    This can happen on one of two reasons:
    1. You're using if/else statements to conditionally select tests. Instead, use "skipWhen".
    2. You are iterating over a list of tests, and their order changed. Use "each" and a custom key prop so that Vest retains their state.`);
}

function removeAllNextTestsInIsolate() {
  const testIsolate = useIsolate();
  const historyNode = useHistoryNode();

  if (!historyNode || !testIsolate) {
    return;
  }

  historyNode.children.length = testIsolate?.children.length;
}

function testReorderDetected(newTest: VestTest, prevTest: VestTest): boolean {
  return isNotEmpty(prevTest) && !isSameProfileTest(prevTest, newTest);
}

function handleKeyTest(newTestObject: VestTest): VestTest {
  invariant(newTestObject.key);

  const prevTestByKey = useHistoryKeyValue(newTestObject.key);

  let nextTest = newTestObject;

  if (!isNullish(prevTestByKey)) {
    nextTest = prevTestByKey;
  }

  useSetIsolateKey(newTestObject.key, nextTest);

  return nextTest;
}

/**
 * @returns {boolean} Whether or not the current isolate allows tests to be reordered
 */
export function shouldAllowReorder(): boolean {
  return useIsolate()?.type === IsolateTypes.EACH;
}
