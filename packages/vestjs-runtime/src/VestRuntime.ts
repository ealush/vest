import { createCascade } from 'context';
import { RuntimeEvents } from './RuntimeEvents';
import {
  invariant,
  deferThrow,
  isNullish,
  assign,
  TinyState,
  text,
  dynamicValue,
  tinyState,
  BusType,
  bus,
  Nullable,
  DynamicValue,
} from 'vest-utils';

import { TIsolate } from './Isolate/Isolate';
import { IsolateInspector } from './Isolate/IsolateInspector';
import { IsolateMutator } from './Isolate/IsolateMutator';
import { IRecociler } from './Reconciler';
import { ErrorStrings } from './errors/ErrorStrings';
import { RuntimeState } from './Orchestrator/RuntimeStates';

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
  isMounting: TinyState<boolean>;
  pendingIsolates: TinyState<Set<TIsolate>>;
  state: TinyState<RuntimeState>;
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

export function useRuntimeState() {
  return useX().stateRef.state();
}

export function useIsStable() {
  const [state] = useRuntimeState();
  return state === RuntimeState.STABLE;
}

export function useIsMounting() {
  return useX().stateRef.isMounting();
}

export function usePendingIsolates() {
  return useX().stateRef.pendingIsolates();
}

export function useXAppData<T = object>() {
  return useX().stateRef.appData as T;
}

export function createRef(
  Reconciler: IRecociler,
  setter: DynamicValue<Record<string, any>>,
): StateRefType {
  return Object.freeze({
    Bus: bus.createBus(),
    Reconciler,
    appData: dynamicValue(setter),
    historyRoot: tinyState.createTinyState<Nullable<TIsolate>>(null),
    isMounting: tinyState.createTinyState<boolean>(false),
    pendingIsolates: tinyState.createTinyState<Set<TIsolate>>(new Set()),
    state: tinyState.createTinyState<RuntimeState>(RuntimeState.STABLE),
  });
}

export function dispatch(event: { type: string; payload?: any }) {
  switch (event.type) {
    case RuntimeEvents.START_MOUNT:
      useHandleStartMount();
      break;

    case RuntimeEvents.END_MOUNT:
      useHandleEndMount();
      break;

    case RuntimeEvents.ISOLATE_PENDING:
      useHandleIsolatePending(event.payload);
      break;

    case RuntimeEvents.ISOLATE_DONE:
      useHandleIsolateDone(event.payload);
      break;
  }
}

function useHandleStartMount() {
  const [, setIsMounting] = useIsMounting();
  setIsMounting(true);
}

function useHandleEndMount() {
  const [, setIsMounting] = useIsMounting();
  const [pendingIsolates] = usePendingIsolates();
  const [state, setState] = useRuntimeState();

  setIsMounting(false);
  if (pendingIsolates.size === 0 && state !== RuntimeState.STABLE) {
    setState(RuntimeState.STABLE);
  }
}

function useHandleIsolatePending(isolate: TIsolate) {
  const [pendingIsolates] = usePendingIsolates();
  const [state, setState] = useRuntimeState();

  pendingIsolates.add(isolate);
  if (state !== RuntimeState.PENDING) {
    setState(RuntimeState.PENDING);
  }
}

function useHandleIsolateDone(isolate: TIsolate) {
  const [pendingIsolates] = usePendingIsolates();
  const [state, setState] = useRuntimeState();
  const [isMounting] = useIsMounting();

  pendingIsolates.delete(isolate);
  if (
    pendingIsolates.size === 0 &&
    !isMounting &&
    state !== RuntimeState.STABLE
  ) {
    setState(RuntimeState.STABLE);
  }
}

export function registerPending(isolate: TIsolate) {
  dispatch({ type: RuntimeEvents.ISOLATE_PENDING, payload: isolate });
}

export function removePending(isolate: TIsolate) {
  dispatch({ type: RuntimeEvents.ISOLATE_DONE, payload: isolate });
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

export function useSetHistoryRoot(history: TIsolate) {
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
  IsolateMutator.setParent(child, currentIsolate);
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

export const RuntimeApi = {
  Run,
  createRef,
  dispatch,
  persist,
  registerPending,
  removePending,
  reset,
  useAvailableRoot,
  useCurrentCursor,
  useHistoryRoot,
  useIsMounting,
  usePendingIsolates,
  useRuntimeState,
  useSetHistoryRoot,
  useSetNextIsolateChild,
  useXAppData,
};
