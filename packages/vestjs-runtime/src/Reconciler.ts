import { CB, Nullable, invariant, isNullish } from 'vest-utils';

import { type Isolate } from 'Isolate';
import { IsolateInspector } from 'IsolateInspector';
import { IsolateMutator } from 'IsolateMutator';
import * as VestRuntime from 'VestRuntime';
import { isSameIsolateType } from 'isIsolateType';
// import { isSameIsolateType } from 'isIsolateType';

// I would rather not use `any` here, but instead use `Isolate`.
// The problem is that it breaks the actual implementation of `Isolate` in `IsolateTest`
// As it is not properly extending `Isolate`.
export interface IRecociler<I = any> {
  (currentNode: I, historyNode: Nullable<Isolate>): I;
}

export function BaseReconciler(
  currentNode: Isolate,
  historyNode: Nullable<Isolate>
): Isolate {
  if (isNullish(historyNode)) {
    return currentNode;
  }
  return currentNode;
}

export class Reconciler {
  static reconcile<Callback extends CB = CB>(
    reconciler: IRecociler<Isolate>,
    node: Isolate,
    callback: Callback
  ): [Isolate, ReturnType<Callback>] {
    const parent = VestRuntime.useIsolate();

    const historyNode = VestRuntime.useHistoryNode();
    let localHistoryNode = historyNode;

    if (parent) {
      // If we have a parent, we need to get the history node from the parent's children
      // We take the history node from the cursor of the active node's children
      localHistoryNode = IsolateInspector.at(
        historyNode,
        IsolateInspector.cursor(parent)
      );
    }

    // const nextNode = reconciler(node, localHistoryNode);
    const nextNode = pickNextNode(reconciler, node, localHistoryNode);

    invariant(nextNode);

    if (Object.is(nextNode, node)) {
      return [node, useRunAsNew(localHistoryNode, node, callback)];
    }

    return [nextNode, nextNode.output];
  }

  static removeAllNextNodesInIsolate() {
    const currentNode = VestRuntime.useIsolate();
    const historyNode = VestRuntime.useHistoryNode();

    if (!historyNode || !currentNode) {
      // This is probably unreachable, but TS is not convinced.
      // Let's play it safe.
      /* istanbul ignore next */
      return;
    }

    IsolateMutator.slice(historyNode, IsolateInspector.cursor(currentNode));
  }

  static handleIsolateNodeWithKey(node: Isolate): Isolate {
    invariant(IsolateInspector.usesKey(node));

    const prevNodeByKey = VestRuntime.useHistoryKey(node.key);

    let nextNode = node;

    if (!isNullish(prevNodeByKey)) {
      nextNode = prevNodeByKey;
    }

    VestRuntime.useSetIsolateKey(node.key, node);

    return nextNode;
  }
}

function useRunAsNew<Callback extends CB = CB>(
  localHistoryNode: Nullable<Isolate>,
  current: Isolate,
  callback: CB
): ReturnType<Callback> {
  const runtimeRoot = VestRuntime.useRuntimeRoot();

  // We're creating a new child isolate context where the local history node
  // is the current history node, thus advancing the history cursor.
  const output = VestRuntime.Run(
    {
      historyNode: localHistoryNode,
      runtimeNode: current,
      ...(!runtimeRoot && { runtimeRoot: current }),
    },
    () => callback(current)
  );

  current.output = output;
  return output;
}

function pickNextNode(
  reconciler: IRecociler,
  currentNode: Isolate,
  historyNode: Nullable<Isolate>
): Isolate {
  if (isNullish(historyNode)) {
    return handleNoHistoryNode(currentNode);
  }

  if (!isSameIsolateType(currentNode, historyNode)) {
    return currentNode;
  }

  return reconciler(currentNode, historyNode);
}

function handleNoHistoryNode<I extends Isolate>(newNode: I): I {
  if (IsolateInspector.usesKey(newNode)) {
    return Reconciler.handleIsolateNodeWithKey(newNode) as I;
  }

  return newNode;
}
