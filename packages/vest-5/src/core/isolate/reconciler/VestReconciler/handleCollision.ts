import { Isolate, IsolateTest, IsolateTypes } from 'IsolateTypes';
import { VestTest } from 'VestTest';
import { getIsolateTest, getIsolateTestX } from 'getIsolateTest';
import { handleNodeWithKey } from 'handleNodeWithKey';
import { isSameProfileTest } from 'isSameProfileTest';
import { testHasKey } from 'testHasKey';
import { deferThrow, invariant, isNullish } from 'vest-utils';

import { useHistoryNode, useIsolate } from 'PersistedContext';
import { isIsolateType } from 'isIsolateType';

export function handleCollision(
  newNode: IsolateTest,
  prevNode: Isolate
): IsolateTest {
  const newTestObject = getIsolateTestX(newNode);

  if (shouldUseKey(newNode, prevNode)) {
    return handleNodeWithKey(newNode);
  }

  const prevTestObject = getIsolateTest(prevNode);

  if (testReorderDetected(newTestObject, prevTestObject)) {
    throwTestOrderError(prevTestObject, newTestObject);
    removeAllNextTestsInIsolate();
    return newNode;
  }

  return (prevNode ? prevNode : newNode) as IsolateTest;
}

function removeAllNextTestsInIsolate() {
  // FIXME: This should probably be a part of isolate

  const testIsolate = useIsolate();
  const historyNode = useHistoryNode();

  if (!historyNode || !testIsolate) {
    return;
  }

  historyNode.children.length = testIsolate?.children.length;
}

function shouldUseKey(newNode: IsolateTest, prevNode: Isolate): boolean {
  const newTestObject = getIsolateTestX(newNode);

  return !!(
    (isNullish(prevNode) || getIsolateTest(prevNode)) &&
    testHasKey(newTestObject)
  );
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

function testReorderDetected(
  newTest: VestTest,
  prevTest: VestTest | undefined
): boolean {
  return !!prevTest && !isSameProfileTest(prevTest, newTest);
}

/**
 * @returns {boolean} Whether or not the current isolate allows tests to be reordered
 */
export function shouldAllowReorder(): boolean {
  const parent = useIsolate();
  invariant(parent);
  return isIsolateType(parent, IsolateTypes.EACH);
}
