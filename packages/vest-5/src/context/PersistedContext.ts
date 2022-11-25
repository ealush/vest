import { Isolate } from 'IsolateTypes';
import { createCascade } from 'context';
import { invariant, tinyState, TinyState } from 'vest-utils';

import { SuiteResult } from 'suiteResult';

export const PersistedContext = createCascade<StateType>(
  // @ts-ignore
  (vestState, parentContext) => {
    if (parentContext) {
      return null;
    }

    invariant(vestState.historyRoot);

    const [historyRoot] = vestState.historyRoot();
    vestState.historyNode = historyRoot;

    return vestState;
  }
);

export function createVestState(): StateType {
  const historyRootState = tinyState.createTinyState<Isolate | null>(null);

  const [historyRoot] = historyRootState();

  return {
    doneCallbacks: tinyState.createTinyState<DoneCallbacks>([]),
    fieldCallbacks: tinyState.createTinyState<FieldCallbacks>({}),
    historyNode: historyRoot,
    historyRoot: historyRootState,
  };
}

type StateType = {
  historyRoot: TinyState<Isolate | null>;
  historyNode: Isolate | null;
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
