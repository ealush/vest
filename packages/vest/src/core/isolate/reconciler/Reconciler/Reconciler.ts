import { CB, invariant, isNullish } from 'vest-utils';

import {
  useHistoryKey,
  useSetIsolateKey,
  useHistoryNode,
  useIsolate,
  useCurrentCursor,
  PersistedContext,
  useRuntimeRoot,
} from 'PersistedContext';
import type { Isolate } from 'isolate';

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
      localHistoryNode = historyNode?.at(useCurrentCursor()) ?? null;
    }

    const nextNode = this.reconciler(node, localHistoryNode);

    invariant(nextNode);

    if (Object.is(nextNode, node)) {
      return [node, runAsNew(localHistoryNode, node, callback)];
    }

    return [nextNode, nextNode.output];
  }

  static removeAllNextNodesInIsolate() {
    const testIsolate = useIsolate();
    const historyNode = useHistoryNode();

    if (!historyNode || !testIsolate) {
      return;
    }

    historyNode.slice(useCurrentCursor());
  }

  static handleCollision(newNode: Isolate, prevNode: Isolate): Isolate {
    // we should base our calculation on the key property
    if (newNode.usesKey()) {
      return this.handleIsolateNodeWithKey(newNode);
    }

    if (this.nodeReorderDetected(newNode, prevNode)) {
      this.onNodeReorder(newNode, prevNode);
    }

    return prevNode ? prevNode : newNode;
  }

  static nodeReorderDetected(newNode: Isolate, prevNode: Isolate): boolean {
    // This is a dummy return just to satisfy the linter. Overrides will supply the real implementation.
    return !(newNode ?? prevNode);
  }

  static onNodeReorder(newNode: Isolate, prevNode: Isolate): Isolate {
    this.removeAllNextNodesInIsolate();
    // This is a dummy return just to satisfy the linter. Overrides will supply the real implementation.
    return newNode ?? prevNode;
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
    () => callback(current)
  );

  current.output = output;
  return output;
}
