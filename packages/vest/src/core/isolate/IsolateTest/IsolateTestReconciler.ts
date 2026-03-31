import { Maybe, Result, makeResult, text } from 'vest-utils';
import { IsolateInspector, Reconciler } from 'vestjs-runtime';
import type { TIsolate } from 'vestjs-runtime';

import { ErrorStrings } from '../../../errors/ErrorStrings';
import { useIsExcluded } from '../../../hooks/focused/useIsExcluded';
import { useVerifyTestRun } from '../../test/testLevelFlowControl/verifyTestRun';

import type { TIsolateTest } from './IsolateTest';
import { VestTest } from './VestTest';
import cancelOverriddenPendingTest from './cancelOverriddenPendingTest';
import { isSameProfileTest } from './isSameProfileTest';
import { useEmit } from '../../VestBus/VestBus';

export class IsolateTestReconciler {
  static match(currentNode: TIsolate, historyNode: TIsolate): boolean {
    return VestTest.is(currentNode) && VestTest.is(historyNode);
  }

  static reconcile(
    currentNode: TIsolateTest,
    historyNode: TIsolateTest,
  ): TIsolateTest {
    const reconcilerOutput = usePickNode(currentNode, historyNode).unwrap();

    const nextNode = useVerifyTestRun(currentNode, reconcilerOutput);

    cancelOverriddenPendingTestOnTestReRun(nextNode, currentNode, historyNode);

    return nextNode;
  }
}

// eslint-disable-next-line max-statements
function usePickNode(
  newNode: TIsolateTest,
  prevNode: TIsolateTest,
): Result<TIsolateTest> {
  if (IsolateInspector.usesKey(newNode)) {
    return useHandleTestWithKey(newNode);
  }

  const newNodeResult = makeResult.Ok(newNode);

  if (
    Reconciler.dropNextNodesOnReorder(nodeReorderDetected, newNode, prevNode)
  ) {
    useOrderResult(newNode, prevNode);
    return newNodeResult;
  }

  if (!VestTest.is(prevNode)) {
    // I believe we cannot actually reach this point.
    // Because it should already be handled by nodeReorderDetected.
    /* istanbul ignore next */
    return newNodeResult;
  }

  // Re-run previously omitted tests to avoid stale "optional" identification.
  // An omitted test has no result, so reusing it would cause the optional
  // system to incorrectly treat the field as optional (since no test ran).
  // Re-evaluation is conservative but correct.
  if (VestTest.isOmitted(prevNode).unwrap()) {
    return newNodeResult;
  }

  return makeResult.Ok(prevNode);
}

function useHandleTestWithKey(newNode: TIsolateTest): Result<TIsolateTest> {
  return VestTest.cast(
    Reconciler.handleIsolateNodeWithKey(newNode, (prevNode: TIsolateTest) => {
      // This is the revoke callback. it determines whether we should revoke the previous node and use the new one.
      if (VestTest.isNonActionable(prevNode).unwrap()) {
        return true;
      }

      if (useIsExcluded(newNode)) {
        return false;
      }

      return true;
    }),
  );
}

function cancelOverriddenPendingTestOnTestReRun(
  nextNode: TIsolate,
  currentNode: TIsolate,
  prevTestObject: TIsolateTest,
) {
  if (nextNode === currentNode && VestTest.is(currentNode)) {
    cancelOverriddenPendingTest(prevTestObject, currentNode).unwrap();
  }
}

function nodeReorderDetected(
  newNode: TIsolateTest,
  prevNode: Maybe<TIsolate>,
): boolean {
  return (
    VestTest.is(prevNode) && !isSameProfileTest(prevNode, newNode).unwrap()
  );
}

function useOrderResult(
  newNode: TIsolateTest,
  prevNode: Maybe<TIsolate>,
): Result<void> {
  if (IsolateInspector.canReorder(newNode)) {
    return makeResult.Ok(undefined);
  }

  const err = makeResult.Err(
    text(ErrorStrings.TESTS_CALLED_IN_DIFFERENT_ORDER, {
      fieldName: VestTest.getData(newNode).fieldName,
      prevName: VestTest.is(prevNode)
        ? VestTest.getData(prevNode).fieldName
        : undefined,
    }),
  );

  useEmit('DEFER_THROW', err);
  return err;
}
