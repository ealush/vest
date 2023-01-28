import { handleIsolateNodeWithKey } from 'handleIsolateNodeWithKey';
import { isOptionalFiedApplied } from 'optional';
import { deferThrow, isNullish, invariant } from 'vest-utils';

import { Isolate } from 'Isolate';
import { IsolateTypes } from 'IsolateTypes';
import { useIsolate } from 'PersistedContext';
import { Reconciler } from 'Reconciler';
import { VestTest } from 'VestTest';
import cancelOverriddenPendingTest from 'cancelOverriddenPendingTest';
import { isExcluded } from 'exclusive';
import { getIsolateTest, getIsolateTestX } from 'getIsolateTest';
import { isIsolateType, isTestIsolate } from 'isIsolateType';
import { isSameProfileTest } from 'isSameProfileTest';
import { shouldSkipBasedOnMode } from 'mode';
import { withinActiveOmitWhen } from 'omitWhen';
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
      return handleNoHistoryNode(currentNode);
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

  static handleCollision(newNode: IsolateTest, prevNode: Isolate): IsolateTest {
    const newTestObject = getIsolateTestX(newNode);

    if (newNode.usesKey()) {
      return handleIsolateNodeWithKey(newNode) as IsolateTest;
    }

    const prevTestObject = getIsolateTest(prevNode);

    if (testReorderDetected(newTestObject, prevTestObject)) {
      throwTestOrderError(prevTestObject, newTestObject);
      this.removeAllNextNodesInIsolate();
      return newNode;
    }

    return (prevNode ? prevNode : newNode) as IsolateTest;
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
}

export class IsolateTest extends Isolate<IsolateTypes.TEST, VestTest> {
  static reconciler = IsolateTestReconciler;

  constructor(type: IsolateTypes.TEST, data: VestTest) {
    super(type, data);

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

function handleNoHistoryNode(testNode: IsolateTest): IsolateTest {
  // const testObject = getIsolateTestX(testNode);

  if (testNode.usesKey()) {
    return handleIsolateNodeWithKey(testNode) as IsolateTest;
  }

  return testNode;
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
function shouldAllowReorder(): boolean {
  const parent = useIsolate();
  invariant(parent);
  return isIsolateType(parent, IsolateTypes.EACH);
}
