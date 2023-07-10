import { createCascade } from 'context';
import {
  invariant,
  deferThrow,
  isNullish,
  // CB,
  assign,
  TinyState,
  text,
  optionalFunctionValue,
  tinyState,
  BusType,
  bus,
  Nullable,
  DynamicValue,
} from 'vest-utils';

import { ErrorStrings } from 'ErrorStrings';
import { Isolate } from 'Isolate';
import { IsolateInspector } from 'IsolateInspector';
import { IsolateMutator } from 'IsolateMutator';
import { IRecociler } from 'Reconciler';

type CTXType = StateRefType & {
  historyNode: Nullable<Isolate>;
  runtimeNode: Nullable<Isolate>;
  runtimeRoot: Nullable<Isolate>;
  stateRef: StateRefType;
};

export type StateRefType = {
  Bus: BusType;
  appData: Record<string, any>;
  historyRoot: TinyState<Nullable<Isolate>>;
  Reconciler: IRecociler;
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
  Reconciler: IRecociler,
  setter: DynamicValue<Record<string, any>>
): StateRefType {
  return Object.freeze({
    Bus: bus.createBus(),
    Reconciler,
    appData: optionalFunctionValue(setter),
    historyRoot: tinyState.createTinyState<Nullable<Isolate>>(null),
  });
}

export function useReconciler() {
  return useX().stateRef.Reconciler;
}

export function persist<T extends (...args: any[]) => any>(cb: T): T {
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

export function addNodeToHistory(node: Isolate): void {
  const parent = useIsolate();
  if (parent) {
    useSetNextIsolateChild(node);
  } else {
    useSetHistory(node);
  }

  IsolateMutator.setParent(node, parent);
}

export function useSetHistory(history: Isolate) {
  const [, setHistoryRoot] = useHistoryRoot();
  setHistoryRoot(history);
}
export function useHistoryKey(key?: Nullable<string>): Nullable<Isolate> {
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
export function useSetNextIsolateChild(child: Isolate): void {
  const currentIsolate = useIsolate();

  invariant(currentIsolate, ErrorStrings.NO_ACTIVE_ISOLATE);

  IsolateMutator.addChild(currentIsolate, child);
}
export function useSetIsolateKey(key: Nullable<string>, value: Isolate): void {
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
export function useAvailableRoot<I extends Isolate = Isolate>(): I {
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
