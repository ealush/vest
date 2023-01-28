import { CB, invariant, isNullish } from 'vest-utils';

import type { Isolate } from 'Isolate';
import {
  useHistoryNode,
  useIsolate,
  useCurrentCursor,
  PersistedContext,
  useRuntimeRoot,
} from 'PersistedContext';

export class Reconciler {
  static reconciler(
    currentNode: Isolate,
    historicNode: Isolate | null
  ): Isolate {
    if (isNullish(historicNode)) {
      return currentNode;
    }
    return currentNode;
  }

  static reconcile<Callback extends CB = CB>(
    node: Isolate,
    callback: Callback
  ): [Isolate, ReturnType<Callback>] {
    const parent = useIsolate();

    const historyNode = useHistoryNode();
    let localHistoryNode = historyNode;

    if (parent) {
      // If we have a parent, we need to get the history node from the parent's children
      // We take the history node from the cursor of the active node's children
      localHistoryNode = historyNode?.children[useCurrentCursor()] ?? null;
    }

    const nextNode = this.reconciler(node, localHistoryNode);

    invariant(nextNode);

    if (Object.is(nextNode, node)) {
      return [node, runAsNew(localHistoryNode, node, callback)];
    }

    return [nextNode, getNodeOuput(nextNode)];
  }

  static removeAllNextNodesInIsolate() {
    const testIsolate = useIsolate();
    const historyNode = useHistoryNode();

    if (!historyNode || !testIsolate) {
      return;
    }

    historyNode.children.length = useCurrentCursor();
  }
}

function getNodeOuput(node: Isolate): any {
  return node.output;
}

function runAsNew<Callback extends CB = CB>(
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
    callback
  );

  current.output = output;
  return output;
}