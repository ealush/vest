import { ErrorStrings } from 'ErrorStrings';
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

import { TIsolate } from 'Isolate';
import { IsolateInspector } from 'IsolateInspector';
import { IsolateMutator } from 'IsolateMutator';
import { IsolateParser } from 'IsolateParser';
import { IRecociler } from 'Reconciler';

type CTXType = StateRefType & {
  historyNode: Nullable<TIsolate>;
  runtimeNode: Nullable<TIsolate>;
  runtimeRoot: Nullable<TIsolate>;
  stateRef: StateRefType;
};

export type StateRefType = {
  Bus: BusType;
  appData: Record<string, any>;
  historyRoot: TinyState<Nullable<TIsolate>>;
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
  useLoadRootNode,
  useSerializeHistoryRoot,
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
    historyRoot: tinyState.createTinyState<Nullable<TIsolate>>(null),
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
export function useHistoryIsolate() {
  return useX().historyNode;
}

/**
 * Returns the history isolate at the current position.
 * If there is a parent isolate, it returns the history node from the parent's children.
 * Otherwise, it returns the history node.
 * @returns {Nullable<TIsolate>} The history isolate at the current position.
 */
export function useHistoryIsolateAtCurrentPosition() {
  const parent = useIsolate();

  // This is most likely the historic counterpart of the parent node

  const historyNode = useHistoryIsolate();

  if (parent) {
    // If we have a parent, we need to get the history node from the parent's children
    // We take the history node from the cursor of the active node's children
    return IsolateInspector.at(historyNode, IsolateInspector.cursor(parent));
  }

  return historyNode;
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
export function useHistoryKey(key?: Nullable<string>): Nullable<TIsolate> {
  if (isNullish(key)) {
    return null;
  }

  const historyNode = useX().historyNode;

  return IsolateInspector.getChildByKey(historyNode, key);
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
export function useSetIsolateKey(key: Nullable<string>, node: TIsolate): void {
  if (!key) {
    return;
  }

  const currentIsolate = useIsolate();

  invariant(currentIsolate, ErrorStrings.NO_ACTIVE_ISOLATE);

  if (isNullish(IsolateInspector.getChildByKey(currentIsolate, key))) {
    IsolateMutator.addChildKey(currentIsolate, key, node);

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

export function useLoadRootNode(node: Record<string, any> | TIsolate): void {
  useSetHistory(IsolateParser.parse(node));
}

export function useSerializeHistoryRoot(): string {
  const [historyRoot] = useHistoryRoot();

  return IsolateInspector.dump(historyRoot);
}
