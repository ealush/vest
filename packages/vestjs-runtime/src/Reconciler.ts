import { ErrorStrings } from 'ErrorStrings';
import {
  Maybe,
  Nullable,
  invariant,
  isNullish,
  optionalFunctionValue,
} from 'vest-utils';

import { type TIsolate } from 'Isolate';
import { IsolateInspector } from 'IsolateInspector';
import { IsolateMutator } from 'IsolateMutator';
import { isSameIsolateType } from 'IsolateSelectors';
import * as VestRuntime from 'VestRuntime';
// import { isSameIsolateType } from 'IsolateSelectors';

// I would rather not use `any` here, but instead use `Isolate`.
// The problem is that it breaks the actual implementation of `Isolate` in `IsolateTest`
// As it is not properly extending `Isolate`.
export interface IRecociler<I = any> {
  (currentNode: I, historyNode: I): Nullable<I>;
}

function BaseReconciler(
  currentNode: TIsolate,
  historyNode: TIsolate,
): TIsolate {
  if (isNullish(historyNode)) {
    return currentNode;
  }
  return currentNode;
}

export class Reconciler {
  /**
   * Reconciles the current isolate with the history isolate.
   * If the current isolate is of a different type than the history isolate,
   * the current isolate is returned.
   * Otherwise, the reconciler function is called to determine the next isolate.
   * If the reconciler function returns null or undefined, the base reconciler is used.
   * If no history isolate exists, the current isolate is returned.
   * @param node The current isolate to reconcile.
   * @returns The next isolate after reconciliation.
   */
  static reconcile(node: TIsolate): TIsolate {
    const localHistoryNode = VestRuntime.useHistoryIsolateAtCurrentPosition();

    const nextNodeResult = pickNextNode(node, localHistoryNode);

    invariant(nextNodeResult, ErrorStrings.UNABLE_TO_PICK_NEXT_ISOLATE);

    return nextNodeResult;
  }

  static dropNextNodesOnReorder<I extends TIsolate>(
    reorderLogic: (newNode: I, prevNode: Maybe<TIsolate>) => boolean,
    newNode: I,
    prevNode: Maybe<TIsolate>,
  ): boolean {
    const didReorder = reorderLogic(newNode, prevNode);

    if (didReorder) {
      removeAllNextNodesInIsolate();
    }

    return didReorder;
  }

  static handleIsolateNodeWithKey<I extends TIsolate>(
    node: TIsolate,

    // The revoke function allows the caller to revoke the previous node
    revoke: ((node: I) => boolean) | false,
  ): TIsolate {
    invariant(IsolateInspector.usesKey(node));

    const prevNodeByKey = VestRuntime.useHistoryKey(node.key);
    let nextNode = node;

    if (
      !isNullish(prevNodeByKey) &&
      !optionalFunctionValue(revoke, prevNodeByKey)
    ) {
      nextNode = prevNodeByKey;
    }

    VestRuntime.useSetIsolateKey(node.key, nextNode);

    return nextNode;
  }
}

function pickNextNode(
  currentNode: TIsolate,
  historyNode: Nullable<TIsolate>,
): TIsolate {
  if (isNullish(historyNode)) {
    return handleNoHistoryNode(currentNode);
  }

  if (!isSameIsolateType(currentNode, historyNode)) {
    return currentNode;
  }

  const reconciler = VestRuntime.useReconciler();

  return (
    reconciler(currentNode, historyNode) ??
    BaseReconciler(currentNode, historyNode)
  );
}

function handleNoHistoryNode<I extends TIsolate>(newNode: I): I {
  if (IsolateInspector.usesKey(newNode)) {
    return Reconciler.handleIsolateNodeWithKey(newNode, false) as I;
  }

  return newNode;
}

function removeAllNextNodesInIsolate() {
  const currentNode = VestRuntime.useIsolate();
  const historyNode = VestRuntime.useHistoryIsolate();

  if (!historyNode || !currentNode) {
    // This is probably unreachable, but TS is not convinced.
    // Let's play it safe.
    /* istanbul ignore next */
    return;
  }

  IsolateMutator.slice(historyNode, IsolateInspector.cursor(currentNode));
}
