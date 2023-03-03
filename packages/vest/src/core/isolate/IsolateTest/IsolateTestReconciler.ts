import { deferThrow, isNullish } from 'vest-utils';

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
      return this.handleIsolateNodeWithKey(newNode) as IsolateTest;
    }

    if (this.nodeReorderDetected(newNode, prevNode)) {
      return this.onNodeReorder(newNode, prevNode);
    }

    return (prevNode ? prevNode : newNode) as IsolateTest;
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
      return this.handleIsolateNodeWithKey(testNode) as IsolateTest;
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

  deferThrow(`Vest Critical Error: Tests called in different order than previous run.
    expected: ${newNode.fieldName}
    received: ${IsolateTest.is(prevNode) ? prevNode.fieldName : undefined}
    This can happen on one of two reasons:
    1. You're using if/else statements to conditionally select tests. Instead, use "skipWhen".
    2. You are iterating over a list of tests, and their order changed. Use "each" and a custom key prop so that Vest retains their state.`);
}
