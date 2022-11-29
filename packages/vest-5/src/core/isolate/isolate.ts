import { Isolate, IsolateTypes } from 'IsolateTypes';
import { CB, invariant } from 'vest-utils';

import {
  useSetNextIsolateChild,
  PersistedContext,
  useHistoryNode,
  useSetHistory,
  useIsolate,
  useRuntimeRoot,
} from 'PersistedContext';
import { VestReconciler } from 'VestReconciler';
import { createIsolate } from 'createIsolate';

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
    const cursor = parent.cursor;

    historyNode = historyNode?.children[cursor] ?? null;
  }
  const output = reconcileHistoryNode(historyNode, current, callback);

  const [nextIsolateChild] = output;

  if (parent) {
    useSetNextIsolateChild(nextIsolateChild);
  }

  if (!parent) {
    useSetHistory(nextIsolateChild);
  }

  return output;
}

function reconcileHistoryNode<Callback extends CB = CB>(
  historyNode: Isolate | null,
  current: Isolate,
  callback: CB
): [Isolate, ReturnType<Callback>] {
  const shouldUseHistoryNode = VestReconciler(historyNode, current);

  if (shouldUseHistoryNode) {
    invariant(historyNode);

    return [historyNode, getNodeOuput(historyNode)];
  }

  return [current, runAsNew(historyNode, current, callback)];
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
