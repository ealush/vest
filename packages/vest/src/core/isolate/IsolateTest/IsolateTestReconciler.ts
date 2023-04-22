import { deferThrow, isNullish, text } from 'vest-utils';

import { ErrorStrings } from 'ErrorStrings';
import { IsolateTest } from 'IsolateTest';
import { Reconciler } from 'Reconciler';
import cancelOverriddenPendingTest from 'cancelOverriddenPendingTest';
import { isSameProfileTest } from 'isSameProfileTest';
import { Isolate } from 'isolate';
import { useVerifyTestRun } from 'verifyTestRun';

export class IsolateTestReconciler extends Reconciler {
  static reconciler(
    currentNode: Isolate,
    historyNode: Isolate | null
  ): Isolate {
    // Start by verifying params
    if (!IsolateTest.is(currentNode)) {
      return currentNode;
    }

    if (isNullish(historyNode)) {
      return this.handleNoHistoryNode(currentNode);
    }

    if (!IsolateTest.is(historyNode)) {
      return currentNode;
    }

    const reconcilerOutput = this.pickNode(historyNode, currentNode);

    cancelOverriddenPendingTestOnTestReRun(
      reconcilerOutput,
      currentNode,
      historyNode
    );

    return reconcilerOutput;
  }

  static nodeReorderDetected(
    newNode: IsolateTest,
    prevNode?: Isolate
  ): boolean {
    return !!IsolateTest.is(prevNode) && !isSameProfileTest(prevNode, newNode);
  }

  static handleCollision(
    newNode: IsolateTest,
    prevNode?: Isolate
  ): IsolateTest {
    if (newNode.usesKey()) {
      return IsolateTest.cast(this.handleIsolateNodeWithKey(newNode));
    }

    if (this.nodeReorderDetected(newNode, prevNode)) {
      return this.onNodeReorder(newNode, prevNode);
    }

    return IsolateTest.cast(prevNode ? prevNode : newNode);
  }

  static onNodeReorder(newNode: IsolateTest, prevNode?: Isolate): IsolateTest {
    throwTestOrderError(newNode, prevNode);
    this.removeAllNextNodesInIsolate();
    return newNode;
  }

  static pickNode(historyNode: IsolateTest, currentNode: IsolateTest): Isolate {
    const collisionResult = this.handleCollision(currentNode, historyNode);

    return useVerifyTestRun(currentNode, collisionResult);
  }

  static handleNoHistoryNode(testNode: IsolateTest): IsolateTest {
    if (testNode.usesKey()) {
      return IsolateTest.cast(this.handleIsolateNodeWithKey(testNode));
    }

    return testNode;
  }
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
