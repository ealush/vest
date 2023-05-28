import { CB, invariant, isNullish } from 'vest-utils';

import type { Isolate } from 'Isolate';
import * as VestRuntime from 'VestRuntime';

export interface IRecociler {
  (currentNode: Isolate, historicNode: Isolate | null): Isolate;
}

export function BaseReconciler(
  currentNode: Isolate,
  historicNode: Isolate | null
): Isolate {
  if (isNullish(historicNode)) {
    return currentNode;
  }
  return currentNode;
}

export class Reconciler {
  static reconcile<Callback extends CB = CB>(
    reconciler: IRecociler,
    node: Isolate,
    callback: Callback
  ): [Isolate, ReturnType<Callback>] {
    const parent = VestRuntime.useIsolate();

    const historyNode = VestRuntime.useHistoryNode();
    let localHistoryNode = historyNode;

    if (parent) {
      // If we have a parent, we need to get the history node from the parent's children
      // We take the history node from the cursor of the active node's children
      localHistoryNode =
        historyNode?.at(VestRuntime.useCurrentCursor()) ?? null;
    }

    const nextNode = reconciler(node, localHistoryNode);

    invariant(nextNode);

    if (Object.is(nextNode, node)) {
      return [node, useRunAsNew(localHistoryNode, node, callback)];
    }

    return [nextNode, nextNode.output];
  }

  static removeAllNextNodesInIsolate() {
    const testIsolate = VestRuntime.useIsolate();
    const historyNode = VestRuntime.useHistoryNode();

    if (!historyNode || !testIsolate) {
      // This is probably unreachable, but TS is not convinced.
      // Let's play it safe.
      return;
    }

    historyNode.slice(VestRuntime.useCurrentCursor());
  }

  static handleIsolateNodeWithKey(node: Isolate): Isolate {
    invariant(node.usesKey());

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
  localHistoryNode: Isolate | null,
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
