/* eslint-disable max-statements */
import { Isolate, IsolateTest, IsolateTypes } from 'IsolateTypes';
import { VestTest } from 'VestTest';
import cancelOverriddenPendingTest from 'cancelOverriddenPendingTest';
import { isExcluded } from 'exclusive';
import { isSameProfileTest } from 'isSameProfileTest';
import { shouldSkipBasedOnMode } from 'mode';
import { withinActiveOmitWhen } from 'omitWhen';
import { isOptionalFiedApplied } from 'optional';
import { isExcludedIndividually } from 'skipWhen';
import { deferThrow, invariant, isNotNullish, isNullish } from 'vest-utils';

import {
  useSetIsolateKey,
  useIsolate,
  useHistoryKeyValue,
  useHistoryNode,
} from 'PersistedContext';

// eslint-disable-next-line max-lines-per-function, complexity
export function VestReconciler(
  historyNode: Isolate | null,
  currentNode: Isolate
): Isolate {
  if (currentNode.type !== IsolateTypes.TEST) {
    return currentNode;
  }

  const testNode = currentNode as IsolateTest;

  const currentTestObject = getIsolateTestX(currentNode);

  if (!historyNode) {
    if (currentTestObject.key) {
      return handleKeyNode(testNode);
    }

    return currentNode;
  }

  const prevTestObject = getIsolateTest(historyNode);

  if (!prevTestObject) {
    return currentNode;
  }

  const collisionResult = handleCollision(testNode, historyNode);

  if (shouldSkipBasedOnMode(currentTestObject)) {
    currentTestObject.skip();
    return currentNode;
  }

  if (
    withinActiveOmitWhen() ||
    isOptionalFiedApplied(currentTestObject.fieldName)
  ) {
    currentTestObject.omit();
    return currentNode;
  }

  if (isExcluded(currentTestObject)) {
    const collisionTestObject = getIsolateTestX(collisionResult);

    // We're forcing skipping the pending test
    // if we're directly within a skipWhen block
    // This mostly means that we're probably giving
    // up on this async test intentionally.
    collisionTestObject.skip(isExcludedIndividually());
    return collisionResult;
  }

  // TODO: This should probably happen everywhere we return the current node
  cancelOverriddenPendingTest(prevTestObject, currentTestObject);

  return currentNode;
}

function getIsolateTestX(isolate: Isolate): VestTest {
  invariant(isolate.data);
  return isolate.data;
}
function getIsolateTest(isolate: Isolate): VestTest | undefined {
  return isolate.data;
}

// eslint-disable-next-line complexity
function handleCollision(newNode: IsolateTest, prevNode: Isolate): IsolateTest {
  const newTestObject = getIsolateTestX(newNode);

  if (
    (isNullish(prevNode) || getIsolateTest(prevNode)) &&
    isNotNullish(newTestObject.key)
  ) {
    return handleKeyNode(newNode);
  }

  const prevTestObject = getIsolateTest(prevNode);

  if (testReorderDetected(newTestObject, prevTestObject)) {
    throwTestOrderError(prevTestObject, newTestObject);
    removeAllNextTestsInIsolate();
    return newNode;
  }

  return (prevNode ? prevNode : newNode) as IsolateTest;
}

function throwTestOrderError(
  prevTest: VestTest | undefined,
  newTestObject: VestTest
): void {
  if (shouldAllowReorder()) {
    return;
  }

  deferThrow(`Vest Critical Error: Tests called in different order than previous run.
    expected: ${prevTest?.fieldName}
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

function testReorderDetected(
  newTest: VestTest,
  prevTest: VestTest | undefined
): boolean {
  return !!prevTest && !isSameProfileTest(prevTest, newTest);
}

function handleKeyNode(testNode: IsolateTest): IsolateTest {
  const testObject = getIsolateTestX(testNode);
  invariant(testObject.key);

  const prevNodeByKey = useHistoryKeyValue(testObject.key);

  let nextNode = testNode;

  if (!isNullish(prevNodeByKey)) {
    // @ts-ignore
    nextNode = prevNodeByKey;
  }

  useSetIsolateKey(testObject.key, testNode);

  return nextNode;
}

/**
 * @returns {boolean} Whether or not the current isolate allows tests to be reordered
 */
export function shouldAllowReorder(): boolean {
  return useIsolate()?.type === IsolateTypes.EACH;
}
