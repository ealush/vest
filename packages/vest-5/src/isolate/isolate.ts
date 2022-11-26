import { Isolate, IsolateTypes } from 'IsolateTypes';
import { CB, invariant } from 'vest-utils';

import { PersistedContext, useHistoryNode } from 'PersistedContext';
import { SuiteContext, useIsolate, useSetNextIsolateChild } from 'SuiteContext';
import { VestReconciler } from 'VestReconciler';
import { createIsolate } from 'createIsolate';

// eslint-disable-next-line max-statements
export function isolate<Callback extends CB = CB>(
  type: IsolateTypes,
  callback: Callback,
  data?: any
): [Isolate, ReturnType<Callback>] {
  const parent = useIsolate();
  const hisoryParent = useHistoryNode();

  const current = createIsolate(type, parent, data);

  let historyNode = null;

  if (parent) {
    const cursor = parent.cursor;
    useSetNextIsolateChild(current);

    historyNode = hisoryParent?.children[cursor] ?? null;
  }

  return reconcileHistoryNode(historyNode, current, callback);
}

function reconcileHistoryNode<Callback extends CB = CB>(
  historyNode: Isolate | null,
  current: Isolate,
  callback: CB
): [Isolate, ReturnType<Callback>] {
  if (VestReconciler(historyNode, current)) {
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
  const output = PersistedContext.run({ historyNode }, () => {
    return SuiteContext.run(
      {
        isolate: current,
      },
      callback
    );
  });

  current.output = output;
  return output;
}
