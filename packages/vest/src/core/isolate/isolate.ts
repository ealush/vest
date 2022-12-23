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

// eslint-disable-next-line max-statements
export function isolate<Callback extends CB = CB>(
  type: IsolateTypes,
  callback: Callback,
  data?: any
): [Isolate, ReturnType<Callback>] {
  const parent = useIsolate();
  let historyNode = useHistoryNode();

  const current = createIsolate(type, parent, data);

  if (parent) {
    historyNode = historyNode?.children[useCurrentCursor()] ?? null;
  }

  const output = reconcileHistoryNode(historyNode, current, callback);

  const [nextIsolateChild] = output;

  if (parent) {
    useSetNextIsolateChild(nextIsolateChild);
  } else {
    useSetHistory(nextIsolateChild);
  }

  return output;
}

function reconcileHistoryNode<Callback extends CB = CB>(
  historyNode: Isolate | null,
  current: Isolate,
  callback: CB
): [Isolate, ReturnType<Callback>] {
  const nextNode = vestReconciler(historyNode, current);

  invariant(nextNode);

  if (nextNode === current) {
    return [current, runAsNew(historyNode, current, callback)];
  }

  return [nextNode, getNodeOuput(nextNode)];
}

function getNodeOuput(node: Isolate): any {
  return node.output;
}

function runAsNew<Callback extends CB = CB>(
  historyNode: Isolate | null,
  current: Isolate,
  callback: CB
): ReturnType<Callback> {
  const runtimeRoot = useRuntimeRoot();
  const output = PersistedContext.run(
    {
      historyNode,
      runtimeNode: current,
      ...(!runtimeRoot && { runtimeRoot: current }),
    },
    callback
  );

  current.output = output;
  return output;
}
