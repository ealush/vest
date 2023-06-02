import { ErrorStrings } from 'ErrorStrings';
import { createCascade } from 'context';
import {
  invariant,
  deferThrow,
  isNullish,
  CB,
  assign,
  TinyState,
  text,
  optionalFunctionValue,
  tinyState,
  BusType,
  bus,
} from 'vest-utils';

import { TIsolate } from 'Isolate';
import { IsolateInspector } from 'IsolateInspector';
import { IsolateMutator } from 'IsolateMutator';

type CTXType = StateRefType & {
  historyNode: TIsolate | null;
  runtimeNode: TIsolate | null;
  runtimeRoot: TIsolate | null;
  stateRef: StateRefType;
};

type StateRefType = {
  historyRoot: TinyState<TIsolate | null>;
  Bus: BusType;
  appData: Record<string, any>;
};

const PersistedContext = createCascade<CTXType>((stateRef, parentContext) => {
  if (parentContext) {
    return null;
  }

  invariant(stateRef.historyRoot);

  const [historyRootNode] = stateRef.historyRoot();

  const ctxRef = {} as CTXType;

  assign(ctxRef, {
    historyNode: historyRootNode,
    runtimeNode: null,
    runtimeRoot: null,
    stateRef,
  });

  return ctxRef;
});

export const Run = PersistedContext.run;

export const RuntimeApi = {
  Run,
  addNodeToHistory,
  createRef,
  persist,
  reset,
  useAvailableRoot,
  useCurrentCursor,
  useXAppData,
};

export function useXAppData<T = object>() {
  return useX().stateRef.appData as T;
}

export function createRef(
  setter: Record<string, any> | (() => Record<string, any>)
): StateRefType {
  return Object.freeze({
    historyRoot: tinyState.createTinyState<TIsolate | null>(null),
    Bus: bus.createBus(),
    appData: optionalFunctionValue(setter),
  });
}

export function persist<T extends CB>(cb: T): T {
  const prev = PersistedContext.useX();

  return ((...args: Parameters<T>): ReturnType<T> => {
    const ctxToUse = PersistedContext.use() ?? prev;
    return PersistedContext.run(ctxToUse.stateRef, () => cb(...args));
  }) as T;
}
export function useX<T = object>(): CTXType & T {
  return PersistedContext.useX() as CTXType & T;
}

export function useHistoryRoot() {
  return useX().stateRef.historyRoot();
}
export function useHistoryNode() {
  return useX().historyNode;
}

export function addNodeToHistory(node: TIsolate): void {
  const parent = useIsolate();
  if (parent) {
    useSetNextIsolateChild(node);
  } else {
    useSetHistory(node);
  }

  IsolateMutator.setParent(node, parent);
}

export function useSetHistory(history: TIsolate) {
  const [, setHistoryRoot] = useHistoryRoot();
  setHistoryRoot(history);
}
export function useHistoryKey(key?: string | null): TIsolate | null {
  if (isNullish(key)) {
    return null;
  }

  const historyNode = useX().historyNode;

  return historyNode?.keys[key] ?? null;
}
export function useIsolate() {
  return useX().runtimeNode ?? null;
}
export function useCurrentCursor() {
  const isolate = useIsolate();
  return isolate ? IsolateInspector.cursor(isolate) : 0;
}
export function useRuntimeRoot() {
  return useX().runtimeRoot;
}
export function useSetNextIsolateChild(child: TIsolate): void {
  const currentIsolate = useIsolate();

  invariant(currentIsolate, ErrorStrings.NO_ACTIVE_ISOLATE);

  IsolateMutator.addChild(currentIsolate, child);
}
export function useSetIsolateKey(key: string | null, value: TIsolate): void {
  if (!key) {
    return;
  }

  const currentIsolate = useIsolate();

  invariant(currentIsolate, ErrorStrings.NO_ACTIVE_ISOLATE);

  if (isNullish(currentIsolate.keys[key])) {
    currentIsolate.keys[key] = value;

    return;
  }

  deferThrow(text(ErrorStrings.ENCOUNTERED_THE_SAME_KEY_TWICE, { key }));
}
export function useAvailableRoot<I extends TIsolate = TIsolate>(): I {
  const root = useRuntimeRoot();

  if (root) {
    return root as I;
  }

  const [historyRoot] = useHistoryRoot();

  return historyRoot as I;
}

export function reset() {
  const [, , resetHistoryRoot] = useHistoryRoot();

  resetHistoryRoot();
}
