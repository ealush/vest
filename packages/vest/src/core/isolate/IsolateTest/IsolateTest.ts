import { isIsolateType, isTestIsolate } from 'isIsolate';
import { deferThrow, isNullish, invariant } from 'vest-utils';

import { Isolate } from 'Isolate';
import { IsolateTypes } from 'IsolateTypes';
import { Reconciler } from 'Reconciler';
import { VestTest } from 'VestTest';
import cancelOverriddenPendingTest from 'cancelOverriddenPendingTest';
import { isExcluded } from 'exclusive';
import { getIsolateTest, getIsolateTestX } from 'getIsolateTest';
import { isSameProfileTest } from 'isSameProfileTest';
import { shouldSkipBasedOnMode } from 'mode';
import { withinActiveOmitWhen } from 'omitWhen';
import { isOptionalFiedApplied } from 'optional';
import { isExcludedIndividually } from 'skipWhen';

class IsolateTestReconciler extends Reconciler {
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

    const prevTestObject = getIsolateTest(historyNode);

    if (isNullish(prevTestObject)) {
      return currentNode;
    }

    const reconcilerOutput = this.pickNode(
      historyNode as IsolateTest,
      currentNode
    );

    cancelOverriddenPendingTestOnTestReRun(
      reconcilerOutput,
      currentNode,
      prevTestObject
    );

    return reconcilerOutput;
  }

  static nodeReorderDetected(
    newNode: IsolateTest,
    prevNode?: Isolate
  ): boolean {
    const prevTest = prevNode?.data;
    const newTest = newNode.data;
    return !!prevTest && !isSameProfileTest(prevTest, newTest);
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
    const currentTestObject = getIsolateTestX(currentNode);

    const collisionResult = this.handleCollision(currentNode, historyNode);

    if (shouldSkipBasedOnMode(currentTestObject)) {
      return skipTestAndReturn(currentNode);
    }

    if (shouldOmit(currentTestObject)) {
      return omitTestAndReturn(currentNode);
    }

    if (isExcluded(currentTestObject)) {
      return forceSkipIfInSkipWhen(collisionResult);
    }

    return currentNode;
  }

  static handleNoHistoryNode(testNode: IsolateTest): IsolateTest {
    // const testObject = getIsolateTestX(testNode);

    if (testNode.usesKey()) {
      return this.handleIsolateNodeWithKey(testNode) as IsolateTest;
    }

    return testNode;
  }
}

export class IsolateTest extends Isolate<IsolateTypes.TEST, VestTest> {
  static reconciler = IsolateTestReconciler;

  constructor(type: IsolateTypes.TEST, data: VestTest) {
    super(type, data);
    this.data = data;

    this.setKey(data.key);
  }
}

function cancelOverriddenPendingTestOnTestReRun(
  nextNode: Isolate,
  currentNode: Isolate,
  prevTestObject: VestTest
) {
  const currentTestObject = getIsolateTestX(currentNode);

  if (nextNode === currentNode) {
    cancelOverriddenPendingTest(prevTestObject, currentTestObject);
  }
}

function shouldOmit(testObject: VestTest): boolean {
  return withinActiveOmitWhen() || isOptionalFiedApplied(testObject.fieldName);
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

function throwTestOrderError(
  newNode: IsolateTest,
  prevNode: Isolate | undefined
): void {
  if (shouldAllowReorder(newNode)) {
    return;
  }

  deferThrow(`Vest Critical Error: Tests called in different order than previous run.
    expected: ${newNode.data.fieldName}
    received: ${prevNode?.data?.fieldName}
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
