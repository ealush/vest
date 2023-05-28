import { ErrorStrings } from 'ErrorStrings';
import { Reconciler } from 'vest-runtime';
import type { Isolate } from 'vest-runtime';
import { deferThrow, isNullish, text } from 'vest-utils';

import { IsolateTest } from 'IsolateTest';
import cancelOverriddenPendingTest from 'cancelOverriddenPendingTest';
import { isSameProfileTest } from 'isSameProfileTest';
import { useVerifyTestRun } from 'verifyTestRun';

// @vx-allow use-use
export function IsolateTestReconciler(
  currentNode: Isolate,
  historyNode: Isolate | null
): Isolate {
  // Start by verifying params
  if (!IsolateTest.is(currentNode)) {
    // This is unreachable, since this function should only be called with IsolateTest nodes
    return currentNode;
  }

  if (isNullish(historyNode)) {
    return handleNoHistoryNode(currentNode);
  }

  if (!IsolateTest.is(historyNode)) {
    return currentNode;
  }

  const reconcilerOutput = usePickNode(historyNode, currentNode);

  cancelOverriddenPendingTestOnTestReRun(
    reconcilerOutput,
    currentNode,
    historyNode
  );

  return reconcilerOutput;
}

// eslint-disable-next-line max-statements

function nodeReorderDetected(
  newNode: IsolateTest,
  prevNode?: Isolate
): boolean {
  return !!IsolateTest.is(prevNode) && !isSameProfileTest(prevNode, newNode);
}

function handleCollision(
  newNode: IsolateTest,
  prevNode?: Isolate
): IsolateTest {
  if (newNode.usesKey()) {
    return IsolateTest.cast(Reconciler.handleIsolateNodeWithKey(newNode));
  }

  if (nodeReorderDetected(newNode, prevNode)) {
    return onNodeReorder(newNode, prevNode);
  }

  if (!IsolateTest.is(prevNode)) {
    // I believe we cannot actually reach this point.
    // Because it should already be handled by nodeReorderDetected.
    return newNode;
  }

  // FIXME: May-13-2023
  // This may not be the most ideal solution.
  // In short: if the node was omitted in the previous run,
  // we want to re-evaluate it. The reason is that we may incorrectly
  // identify it is "optional" because it was omitted in the previous run.
  // There may be a better way to handle this. Need to revisit this.
  if (prevNode.isOmitted()) {
    return newNode;
  }

  return prevNode;
}

function onNodeReorder(newNode: IsolateTest, prevNode?: Isolate): IsolateTest {
  throwTestOrderError(newNode, prevNode);
  Reconciler.removeAllNextNodesInIsolate();
  return newNode;
}

function usePickNode(
  historyNode: IsolateTest,
  currentNode: IsolateTest
): Isolate {
  const collisionResult = handleCollision(currentNode, historyNode);

  return useVerifyTestRun(currentNode, collisionResult);
}

function handleNoHistoryNode(testNode: IsolateTest): IsolateTest {
  if (testNode.usesKey()) {
    return IsolateTest.cast(Reconciler.handleIsolateNodeWithKey(testNode));
  }

  return testNode;
}

function cancelOverriddenPendingTestOnTestReRun(
  nextNode: Isolate,
  currentNode: Isolate,
  prevTestObject: IsolateTest
) {
  if (nextNode === currentNode && IsolateTest.is(currentNode)) {
    cancelOverriddenPendingTest(prevTestObject, currentNode);
  }
}

function throwTestOrderError(
  newNode: IsolateTest,
  prevNode: Isolate | undefined
): void {
  if (newNode.shouldAllowReorder()) {
    return;
  }

  deferThrow(
    text(ErrorStrings.TESTS_CALLED_IN_DIFFERENT_ORDER, {
      fieldName: newNode.fieldName,
      prevName: IsolateTest.is(prevNode) ? prevNode.fieldName : undefined,
    })
  );
}
