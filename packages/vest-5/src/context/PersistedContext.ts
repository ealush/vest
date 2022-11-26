import { Isolate } from 'IsolateTypes';
import { createCascade } from 'context';
import { assign } from 'lodash';
import { invariant, isNullish, tinyState, TinyState } from 'vest-utils';

import { SuiteResult } from 'suiteResult';

export const PersistedContext = createCascade<CTXType>(
  (vestState, parentContext) => {
    if (parentContext) {
      return null;
    }

    invariant(vestState.historyRoot);

    const [historyRoot] = vestState.historyRoot();

    return assign(
      {
        historyNody: historyRoot,
      },
      vestState
    ) as CTXType;
  }
);

export function createVestState(): StateType {
  return {
    doneCallbacks: tinyState.createTinyState<DoneCallbacks>([]),
    fieldCallbacks: tinyState.createTinyState<FieldCallbacks>({}),
    historyRoot: tinyState.createTinyState<Isolate | null>(null),
  };
}

type CTXType = StateType & {
  historyNode: Isolate | null;
};

type StateType = {
  historyRoot: TinyState<Isolate | null>;
  doneCallbacks: TinyState<DoneCallbacks>;
  fieldCallbacks: TinyState<FieldCallbacks>;
};

type FieldCallbacks = Record<string, DoneCallbacks>;
type DoneCallbacks = Array<DoneCallback>;
export type DoneCallback = (res: SuiteResult) => void;

export function useDoneCallbacks() {
  return PersistedContext.useX().doneCallbacks();
}

export function useFieldCallbacks() {
  return PersistedContext.useX().fieldCallbacks();
}

export function useHistoryRoot() {
  return PersistedContext.useX().historyRoot();
}

export function useHistoryNode() {
  return PersistedContext.useX().historyNode;
}

export function useSetHistory(history: Isolate) {
  const context = PersistedContext.useX();

  const [, setHistoryRoot] = context.historyRoot();

  setHistoryRoot(history);
}

export function useHistoryKeyValue(key?: string | null) {
  if (isNullish(key)) {
    return;
  }

  const historyNode = PersistedContext.useX().historyNode;

  return historyNode?.keys[key];
}
