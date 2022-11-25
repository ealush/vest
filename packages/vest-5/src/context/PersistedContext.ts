import { Isolate } from 'IsolateTypes';
import { createCascade } from 'context';
import { tinyState, TinyState } from 'vest-utils';

import { SuiteResult } from 'suiteResult';

export const PersistedContext = createCascade<StateType>(
  // @ts-ignore
  (vestState, parentContext) => {
    if (parentContext) {
      return null;
    }

    return vestState;
  }
);

export function createVestState(): StateType {
  const historyRoot = tinyState.createTinyState<Isolate | null>(null);

  return {
    doneCallbacks: tinyState.createTinyState<DoneCallbacks>([]),
    fieldCallbacks: tinyState.createTinyState<FieldCallbacks>({}),
    historyNode: historyRoot,
    historyRoot,
  };
}

type StateType = {
  historyRoot: TinyState<Isolate | null>;
  historyNode: TinyState<Isolate | null>;
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
  return PersistedContext.useX().historyNode();
}
