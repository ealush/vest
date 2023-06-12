import { Nullable, deferThrow, isNullish, text } from 'vest-utils';
import { IsolateInspector, Reconciler } from 'vestjs-runtime';
import type { Isolate } from 'vestjs-runtime';

import { ErrorStrings } from 'ErrorStrings';
import type { IsolateTest } from 'IsolateTest';
import { VestTestInspector } from 'VestTestInspector';
import cancelOverriddenPendingTest from 'cancelOverriddenPendingTest';
import { castIsolateTest, isIsolateTest } from 'isIsolateTest';
import { isSameProfileTest } from 'isSameProfileTest';
import { useVerifyTestRun } from 'verifyTestRun';

// @vx-allow use-use
export function IsolateTestReconciler(
  currentNode: IsolateTest,
  historyNode: Nullable<Isolate>
): IsolateTest {
  if (isNullish(historyNode)) {
    return handleNoHistoryNode(currentNode);
  }

  if (!isIsolateTest(historyNode)) {
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
  return !!isIsolateTest(prevNode) && !isSameProfileTest(prevNode, newNode);
}

function handleCollision(
  newNode: IsolateTest,
  prevNode?: Isolate
): IsolateTest {
  if (IsolateInspector.usesKey(newNode)) {
    return castIsolateTest(Reconciler.handleIsolateNodeWithKey(newNode));
  }

  if (nodeReorderDetected(newNode, prevNode)) {
    return onNodeReorder(newNode, prevNode);
  }

  if (!isIsolateTest(prevNode)) {
    // I believe we cannot actually reach this point.
    // Because it should already be handled by nodeReorderDetected.
    /* istanbul ignore next */
    return newNode;
  }

  // FIXME: May-13-2023
  // This may not be the most ideal solution.
  // In short: if the node was omitted in the previous run,
  // we want to re-evaluate it. The reason is that we may incorrectly
  // identify it is "optional" because it was omitted in the previous run.
  // There may be a better way to handle this. Need to revisit this.
  if (VestTestInspector.isOmitted(prevNode)) {
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
): IsolateTest {
  const collisionResult = handleCollision(currentNode, historyNode);

  return useVerifyTestRun(currentNode, collisionResult);
}

function handleNoHistoryNode(testNode: IsolateTest): IsolateTest {
  if (IsolateInspector.usesKey(testNode)) {
    return castIsolateTest(Reconciler.handleIsolateNodeWithKey(testNode));
  }

  return testNode;
}

function cancelOverriddenPendingTestOnTestReRun(
  nextNode: Isolate,
  currentNode: Isolate,
  prevTestObject: IsolateTest
) {
  if (nextNode === currentNode && isIsolateTest(currentNode)) {
    cancelOverriddenPendingTest(prevTestObject, currentNode);
  }
}

function throwTestOrderError(
  newNode: IsolateTest,
  prevNode: Isolate | undefined
): void {
  if (IsolateInspector.shouldAllowReorder(newNode)) {
    return;
  }

  deferThrow(
    text(ErrorStrings.TESTS_CALLED_IN_DIFFERENT_ORDER, {
      fieldName: newNode.fieldName,
      prevName: isIsolateTest(prevNode) ? prevNode.fieldName : undefined,
    })
  );
}
