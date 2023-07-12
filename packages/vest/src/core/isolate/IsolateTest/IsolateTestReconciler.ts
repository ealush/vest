import { Maybe, deferThrow, text } from 'vest-utils';
import { IsolateInspector, Reconciler } from 'vestjs-runtime';
import type { TIsolate } from 'vestjs-runtime';

import { ErrorStrings } from 'ErrorStrings';
import type { TIsolateTest } from 'IsolateTest';
import { VestTestInspector } from 'VestTestInspector';
import cancelOverriddenPendingTest from 'cancelOverriddenPendingTest';
import { castIsolateTest, isIsolateTest } from 'isIsolateTest';
import { isSameProfileTest } from 'isSameProfileTest';
import { useVerifyTestRun } from 'verifyTestRun';

// @vx-allow use-use
export function IsolateTestReconciler(
  currentNode: TIsolateTest,
  historyNode: TIsolateTest
): TIsolateTest {
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
  newNode: TIsolateTest,
  prevNode?: TIsolate
): boolean {
  return !!isIsolateTest(prevNode) && !isSameProfileTest(prevNode, newNode);
}

function handleCollision(
  newNode: TIsolateTest,
  prevNode?: TIsolate
): TIsolateTest {
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

function onNodeReorder(
  newNode: TIsolateTest,
  prevNode?: TIsolate
): TIsolateTest {
  throwTestOrderError(newNode, prevNode);
  Reconciler.removeAllNextNodesInIsolate();
  return newNode;
}

function usePickNode(
  historyNode: TIsolateTest,
  currentNode: TIsolateTest
): TIsolateTest {
  const collisionResult = handleCollision(currentNode, historyNode);

  return useVerifyTestRun(currentNode, collisionResult);
}

function cancelOverriddenPendingTestOnTestReRun(
  nextNode: TIsolate,
  currentNode: TIsolate,
  prevTestObject: TIsolateTest
) {
  if (nextNode === currentNode && isIsolateTest(currentNode)) {
    cancelOverriddenPendingTest(prevTestObject, currentNode);
  }
}

function throwTestOrderError(
  newNode: TIsolateTest,
  prevNode: Maybe<TIsolate>
): void {
  if (IsolateInspector.canReorder(newNode)) {
    return;
  }

  deferThrow(
    text(ErrorStrings.TESTS_CALLED_IN_DIFFERENT_ORDER, {
      fieldName: newNode.fieldName,
      prevName: isIsolateTest(prevNode) ? prevNode.fieldName : undefined,
    })
  );
}
