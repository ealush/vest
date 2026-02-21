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
  asArray,
} from 'vest-utils';

import * as Walker from './IsolateWalker';
import {
  TIsolateFocused,
  FocusSelectors,
  FocusModes,
} from './Isolate/IsolateFocused';
import { TIsolate } from './Isolate/Isolate';
import { IsolateInspector } from './Isolate/IsolateInspector';
import { IsolateMutator } from './Isolate/IsolateMutator';
import { IReconciler } from './Reconciler';
import { ErrorStrings } from './errors/ErrorStrings';
import { RuntimeState } from './Orchestrator/RuntimeStates';

type CTXType = StateRefType & {
  historyNode: Nullable<TIsolate>;
  runtimeNode: Nullable<TIsolate>;
  runtimeRoot: Nullable<TIsolate>;
  stateRef: StateRefType;
};

/**
 * The state reference type for the Vest runtime.
 * Holds all mutable state for the runtime instance.
 */
export type StateRefType = {
  Bus: BusType<RuntimeEvents>;
  appData: Record<string, any>;
  historyRoot: TinyState<Nullable<TIsolate>>;
  Reconciler: IReconciler;
  implicitOnlyNodes: Set<TIsolate>;
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

/**
 * Runs a function within the Vest runtime context.
 * This is the main entry point for executing Vest suites.
 */
export const Run = PersistedContext.run;

/**
 * Retrieves the current runtime state (e.g., STABLE, PENDING).
 */
export function useRuntimeState() {
  return useIsStable() ? RuntimeState.STABLE : RuntimeState.PENDING;
}

/**
 * Checks if the runtime is currently stable (no pending tests).
 */
export function useIsStable() {
  const root = useAvailableRoot();

  if (!root) {
    return true;
  }

  return !IsolateInspector.hasPending(root);
}

/**
 * Retrieves the application-specific data stored in the runtime.
 */
export function useXAppData<T = object>() {
  return useX().stateRef.appData as T;
}

/**
 * Creates a new state reference for such as the history root, pending isolates, and the current runtime state.
 */
export function createRef(
  Reconciler: IReconciler,
  setter: DynamicValue<Record<string, any>>,
): StateRefType {
  const ref = Object.freeze({
    Bus: bus.createBus<RuntimeEvents>(),
    Reconciler,
    appData: dynamicValue(setter),
    historyRoot: tinyState.createTinyState<Nullable<TIsolate>>(null),
    implicitOnlyNodes: new Set<TIsolate>(),
  });

  return ref;
}

/**
 * Dispatches a runtime event to the internal Bus.
 * This is used to trigger state changes and notifications.
 */
export function dispatch<T extends keyof RuntimeEvents>(
  event: RuntimeEvents[T] extends void
    ? { type: T; payload?: void }
    : { type: T; payload: RuntimeEvents[T] },
) {
  useX().stateRef.Bus.emit(event.type, event.payload as any);
}

/**
 * Registers an isolate as pending.
 * This is used to track async tests and other async operations.
 */
export function registerPending(isolate: TIsolate) {
  dispatch({ type: 'ISOLATE_PENDING', payload: isolate });
}

/**
 * Removes an isolate from the pending set.
 * This is used when an async test or operation completes.
 */
export function removePending(isolate: TIsolate) {
  dispatch({ type: 'ISOLATE_DONE', payload: isolate });
}

/**
 * Retrieves the Reconciler used by the current runtime.
 */
export function useReconciler() {
  return useX().stateRef.Reconciler;
}

/**
 * Persists the current runtime context to a callback function.
 * This allows the callback to be executed later (e.g. in an async operation)
 * while still having access to the correct runtime context.
 */
export function persist<T extends (...args: any[]) => any>(cb: T): T {
  const prev = PersistedContext.useX();

  return ((...args: Parameters<T>): ReturnType<T> => {
    const ctxToUse = PersistedContext.use() ?? prev;
    return PersistedContext.run(ctxToUse.stateRef, () => cb(...args));
  }) as T;
}
/**
 * Retrieves the current runtime context.
 * Throws if called outside of a Vest runtime.
 */
export function useX<T = object>(): CTXType & T {
  return PersistedContext.useX() as CTXType & T;
}

/**
 * Retrieves the history root state.
 */
export function useHistoryRoot() {
  return useX().stateRef.historyRoot();
}

/**
 * Retrieves the current history isolate (the one matching the current runtime isolate).
 */
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
  const historyNode = useHistoryIsolate();

  if (!parent) {
    return historyNode;
  }

  if (isNullish(historyNode)) {
    return null;
  }

  const nonTransientIndex = countNonTransientBefore(
    parent.children || [],
    IsolateInspector.cursor(parent),
  );

  return findNthNonTransient(historyNode.children || [], nonTransientIndex);
}

/**
 * Counts non-transient children before the given cursor position.
 */
function countNonTransientBefore(siblings: TIsolate[], cursor: number): number {
  let count = 0;
  for (let i = 0; i < cursor; i++) {
    if (!siblings[i]?.transient) {
      count++;
    }
  }
  return count;
}

/**
 * Finds the Nth non-transient child in a children array.
 * This is used to align the reconciler cursor, skipping over
 * transient nodes that should not affect the index of stateful nodes.
 */
function findNthNonTransient(
  children: TIsolate[],
  n: number,
): Nullable<TIsolate> {
  return children.filter(child => child && !child.transient)[n] ?? null;
}

/**
 * Sets the history root for the runtime.
 * This is used to hydrate the runtime with previous results.
 */
export function useSetHistoryRoot(history: TIsolate) {
  const [, setHistoryRoot] = useHistoryRoot();
  setHistoryRoot(history);
}

/**
 * Retrieves a child isolate from the history tree by its key.
 */
export function useHistoryKey(key?: Nullable<string>): Nullable<TIsolate> {
  if (isNullish(key)) {
    return null;
  }

  const historyNode = useX().historyNode;

  return IsolateInspector.getChildByKey(historyNode, key);
}

/**
 * Retrieves the currently active isolate in the runtime tree.
 */
export function useIsolate() {
  return useX().runtimeNode ?? null;
}

/**
 * Retrieves the current cursor position within the active isolate.
 */
export function useCurrentCursor() {
  const isolate = useIsolate();
  return isolate ? IsolateInspector.cursor(isolate) : 0;
}

/**
 * Retrieves the root of the current runtime tree.
 */
export function useRuntimeRoot() {
  return useX().runtimeRoot;
}

/**
 * Adds a child isolate to the current isolate and sets the parent-child relationship.
 */
export function useSetNextIsolateChild(child: TIsolate): void {
  const currentIsolate = useIsolate();

  invariant(currentIsolate, ErrorStrings.NO_ACTIVE_ISOLATE);

  IsolateMutator.addChild(currentIsolate, child);
  IsolateMutator.setParent(child, currentIsolate);

  if (
    FocusSelectors.isIsolateFocused(child) &&
    child.data?.focusMode === FocusModes.ONLY
  ) {
    useX().stateRef.implicitOnlyNodes.add(currentIsolate);
  }
}

/**
 * Sets a key for a child isolate within the current isolate.
 * Throws if the key is already taken.
 */
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
/**
 * Returns the available root isolate.
 * If a runtime root exists (i.e. we are currently running a suite), it returns that.
 * Otherwise, it returns the history root (i.e. the result of the last run).
 */
export function useAvailableRoot<I extends TIsolate = TIsolate>(): I {
  const root = useRuntimeRoot();

  if (root) {
    return root as I;
  }

  const [historyRoot] = useHistoryRoot();

  return historyRoot as I;
}

/**
 * Checks whether a specific key is heavily focused out.
 */
export function useIsFocusedOut(key?: string): boolean {
  const current = useIsolate();
  if (!current) return false;

  const focusMatch = Walker.findClosest<TIsolateFocused>(
    current,
    (child: TIsolate): boolean => {
      if (!FocusSelectors.isIsolateFocused(child)) return false;
      const data = child.data;
      if (!data) return false;
      if (data.matchAll) return true;

      if (isNullish(key)) return false;
      return asArray(data.match).includes(key);
    },
  );

  if (focusMatch) {
    if (FocusSelectors.isSkipFocused(focusMatch, key)) return true;
    if (FocusSelectors.isOnlyFocused(focusMatch, key)) return false;
  }

  return hasImplicitOnly();
}

function hasImplicitOnly(): boolean {
  let current = useIsolate();
  const registry = useX().stateRef.implicitOnlyNodes;

  while (current) {
    if (registry.has(current)) {
      return true;
    }
    current = current.parent;
  }

  return false;
}

/**
 * Resets the history root.
 */
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
  useIsFocusedOut,
  useIsStable,
  useRuntimeState,
  useSetHistoryRoot,
  useSetNextIsolateChild,
  useXAppData,
};
