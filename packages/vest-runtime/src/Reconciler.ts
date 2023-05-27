import type { Isolate } from 'Isolate';
// import {
//   useHistoryKey,
//   useSetIsolateKey,
//   useHistoryNode,
//   useIsolate,
//   useCurrentCursor,
//   PersistedContext,
//   useRuntimeRoot,
// } from 'PersistedContext';
import { CB, invariant, isNullish } from 'vest-utils';

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
    const parent = useIsolate();

    const historyNode = useHistoryNode();
    let localHistoryNode = historyNode;

    if (parent) {
      // If we have a parent, we need to get the history node from the parent's children
      // We take the history node from the cursor of the active node's children
      localHistoryNode = historyNode?.at(useCurrentCursor()) ?? null;
    }

    const nextNode = reconciler(node, localHistoryNode);

    invariant(nextNode);

    if (Object.is(nextNode, node)) {
      return [node, useRunAsNew(localHistoryNode, node, callback)];
    }

    return [nextNode, nextNode.output];
  }

  static removeAllNextNodesInIsolate() {
    const testIsolate = useIsolate();
    const historyNode = useHistoryNode();

    if (!historyNode || !testIsolate) {
      // This is probably unreachable, but TS is not convinced.
      // Let's play it safe.
      return;
    }

    historyNode.slice(useCurrentCursor());
  }

  static handleIsolateNodeWithKey(node: Isolate): Isolate {
    invariant(node.usesKey());

    const prevNodeByKey = useHistoryKey(node.key);

    let nextNode = node;

    if (!isNullish(prevNodeByKey)) {
      nextNode = prevNodeByKey;
    }

    useSetIsolateKey(node.key, node);

    return nextNode;
  }
}

function useRunAsNew<Callback extends CB = CB>(
  localHistoryNode: Isolate | null,
  current: Isolate,
  callback: CB
): ReturnType<Callback> {
  const runtimeRoot = useRuntimeRoot();

  // We're creating a new child isolate context where the local history node
  // is the current history node, thus advancing the history cursor.
  const output = PersistedContext.run(
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
