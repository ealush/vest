import { isOptionalFiedApplied } from 'optional';
import { deferThrow, isNullish, invariant } from 'vest-utils';

import { IsolateTest } from 'IsolateTest';
import { IsolateTypes } from 'IsolateTypes';
import { Reconciler } from 'Reconciler';
import cancelOverriddenPendingTest from 'cancelOverriddenPendingTest';
import { isExcluded } from 'exclusive';
import { isIsolateType, isTestIsolate } from 'isIsolate';
import { isSameProfileTest } from 'isSameProfileTest';
import { Isolate } from 'isolate';
import { shouldSkipBasedOnMode } from 'mode';
import { withinActiveOmitWhen } from 'omitWhen';
import { isExcludedIndividually } from 'skipWhen';

export class IsolateTestReconciler extends Reconciler {
  static reconciler(
    currentNode: Isolate,
    historyNode: Isolate | null
  ): Isolate {
    // Start by verifying params
    if (!isTestIsolate(currentNode)) {
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

    if (shouldSkipBasedOnMode(currentNode)) {
      return skipTestAndReturn(currentNode);
    }

    if (shouldOmit(currentNode)) {
      return omitTestAndReturn(currentNode);
    }

    if (isExcluded(currentNode)) {
      return forceSkipIfInSkipWhen(collisionResult);
    }

    return currentNode;
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

function shouldOmit(testObject: IsolateTest): boolean {
  return withinActiveOmitWhen() || isOptionalFiedApplied(testObject.fieldName);
}

function skipTestAndReturn(testNode: IsolateTest): IsolateTest {
  testNode.skip();
  return testNode;
}

function omitTestAndReturn(testNode: IsolateTest): IsolateTest {
  testNode.omit();
  return testNode;
}

function forceSkipIfInSkipWhen(testNode: IsolateTest): IsolateTest {
  // We're forcing skipping the pending test
  // if we're directly within a skipWhen block
  // This mostly means that we're probably giving
  // up on this async test intentionally.
  testNode.skip(isExcludedIndividually());
  return testNode;
}

function throwTestOrderError(
  newNode: IsolateTest,
  prevNode: Isolate | undefined
): void {
  if (shouldAllowReorder(newNode)) {
    return;
  }

  deferThrow(`Vest Critical Error: Tests called in different order than previous run.
    expected: ${newNode.fieldName}
    received: ${IsolateTest.is(prevNode) ? prevNode.fieldName : undefined}
    This can happen on one of two reasons:
    1. You're using if/else statements to conditionally select tests. Instead, use "skipWhen".
    2. You are iterating over a list of tests, and their order changed. Use "each" and a custom key prop so that Vest retains their state.`);
}

/**
 * @returns {boolean} Whether or not the current isolate allows tests to be reordered
 */
function shouldAllowReorder(newNode: IsolateTest): boolean {
  const parent = newNode.parent;
  invariant(parent);
  return isIsolateType(parent, IsolateTypes.EACH);
}
