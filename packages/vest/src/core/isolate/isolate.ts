import { CB, invariant } from 'vest-utils';

import { Isolate, IsolateTypes } from 'IsolateTypes';
import {
  useSetNextIsolateChild,
  PersistedContext,
  useHistoryNode,
  useSetHistory,
  useIsolate,
  useRuntimeRoot,
  useCurrentCursor,
} from 'PersistedContext';
import { createIsolate } from 'createIsolate';
import { vestReconciler } from 'vestReconciler';

export function isolate<Callback extends CB = CB>(
  type: IsolateTypes,
  callback: Callback,
  data?: any
): [Isolate, ReturnType<Callback>] {
  const parent = useIsolate();

  const current = createIsolate(type, parent, data);

  const output = reconcileHistoryNode(current, callback);

  const [nextIsolateChild] = output;

  if (parent) {
    useSetNextIsolateChild(nextIsolateChild);
  } else {
    useSetHistory(nextIsolateChild);
  }

  return output;
}

function reconcileHistoryNode<Callback extends CB = CB>(
  current: Isolate,
  callback: CB
): [Isolate, ReturnType<Callback>] {
  const parent = useIsolate();

  const historyNode = useHistoryNode();
  let localHistoryNode = historyNode;

  if (parent) {
    // If we have a parent, we need to get the history node from the parent's children
    // We take the history node from the cursor of the active node's children
    localHistoryNode = historyNode?.children[useCurrentCursor()] ?? null;
  }

  const nextNode = vestReconciler(localHistoryNode, current);

  invariant(nextNode);

  if (Object.is(nextNode, current)) {
    return [current, runAsNew(localHistoryNode, current, callback)];
  }

  return [nextNode, getNodeOuput(nextNode)];
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
