import { createCascade } from 'context';
import {
  invariant,
  deferThrow,
  isNullish,
  CB,
  seq,
  cache,
  assign,
  BusType,
  TinyState,
  tinyState,
  CacheApi,
} from 'vest-utils';

import { Isolate } from 'IsolateTypes';
import { OptionalFields } from 'OptionalTypes';
import { SuiteName, SuiteResult } from 'SuiteResultTypes';
import { Events, initVestBus } from 'VestBus';

const suiteResultCache = cache<SuiteResult>();

export const PersistedContext = createCascade<CTXType>(
  (vestState, parentContext) => {
    if (parentContext) {
      return null;
    }

    invariant(vestState.historyRoot);

    const [historyRootNode] = vestState.historyRoot();

    const ctxRef = {} as CTXType;

    assign(
      ctxRef,
      {
        historyNode: historyRootNode,
        optional: {},
        runtimeNode: null,
        runtimeRoot: null,
      },
      vestState
    );

    return ctxRef;
  }
);

export function createVestState({
  suiteName,
}: {
  suiteName?: SuiteName;
}): StateType {
  const stateRef: StateType = {
    VestBus: initVestBus(),
    doneCallbacks: tinyState.createTinyState<DoneCallbacks>(() => []),
    fieldCallbacks: tinyState.createTinyState<FieldCallbacks>(() => ({})),
    historyRoot: tinyState.createTinyState<Isolate | null>(null),
    optional: {},
    suiteId: seq(),
    suiteName,
    suiteResultCache,
  };

  return stateRef;
}

export function persist<T extends CB>(cb: T): T {
  const prev = PersistedContext.useX();

  // @ts-ignore
  return function persisted(...args: Parameters<T>): ReturnType<T> {
    const ctxToUse = PersistedContext.use() ?? prev;
    return PersistedContext.run(ctxToUse, () => cb(...args));
  };
}

export function useSuiteResultCache(action: () => SuiteResult) {
  const suiteResultCache = PersistedContext.useX().suiteResultCache;

  return suiteResultCache([useSuiteId()], action);
}

export function useExpireSuiteResultCache() {
  const suiteResultCache = PersistedContext.useX().suiteResultCache;
  suiteResultCache.invalidate([useSuiteId()]);
}

export function useResetCallbacks() {
  const [, , resetDoneCallbacks] = useDoneCallbacks();
  const [, , resetFieldCallbacks] = useFieldCallbacks();

  resetDoneCallbacks();
  resetFieldCallbacks();
}

export function useResetSuite() {
  useResetCallbacks();
  const [, , resetHistoryRoot] = useHistoryRoot();

  resetHistoryRoot();
}

type CTXType = StateType & {
  historyNode: Isolate | null;
  runtimeNode: Isolate | null;
  runtimeRoot: Isolate | null;
};

type StateType = {
  historyRoot: TinyState<Isolate | null>;
  doneCallbacks: TinyState<DoneCallbacks>;
  fieldCallbacks: TinyState<FieldCallbacks>;
  suiteName: string | undefined;
  suiteId: string;
  optional: OptionalFields;
  VestBus: BusType;
  suiteResultCache: CacheApi<SuiteResult>;
};

type FieldCallbacks = Record<string, DoneCallbacks>;
type DoneCallbacks = Array<DoneCallback>;

export function useVestBus() {
  return PersistedContext.useX().VestBus;
}

/*
  Returns an emitter, but it also has a shortcut for emitting an event immediately
  by passing an event name.
*/
export function useEmit() {
  return persist(useVestBus().emit);
}

export function prepareEmitter<T = void>(event: Events): (arg: T) => void {
  const emit = useEmit();

  return (arg: T) => emit(event, arg);
}

export type DoneCallback = (res: SuiteResult) => void;

export function useOptionalFields(): OptionalFields {
  return PersistedContext.useX().optional;
}

export function useOptionalField(fieldName: string) {
  return useOptionalFields()[fieldName] ?? {};
}

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

export function useSuiteName() {
  return PersistedContext.useX().suiteName;
}

export function useSuiteId() {
  return PersistedContext.useX().suiteId;
}

export function useSetHistory(history: Isolate) {
  const context = PersistedContext.useX();

  const [, setHistoryRoot] = context.historyRoot();
  setHistoryRoot(history);
}

export function useHistoryKey(key?: string | null): Isolate | null {
  if (isNullish(key)) {
    return null;
  }

  const historyNode = PersistedContext.useX().historyNode;

  return historyNode?.keys[key] ?? null;
}

export function useIsolate() {
  return PersistedContext.useX().runtimeNode ?? null;
}

export function useCurrentCursor() {
  return useIsolate()?.children.length ?? 0;
}

export function useRuntimeRoot() {
  return PersistedContext.useX().runtimeRoot;
}

export function useSetNextIsolateChild(child: Isolate): void {
  const currentIsolate = useIsolate();

  invariant(currentIsolate, 'Not within an active isolate');

  currentIsolate.children.push(child);
}

export function useSetIsolateKey(
  key: string | undefined,
  value: Isolate
): void {
  if (!key) {
    return;
  }

  const currentIsolate = useIsolate();

  invariant(currentIsolate, 'Not within an active isolate');

  if (isNullish(currentIsolate.keys[key])) {
    currentIsolate.keys[key] = value;

    return;
  }

  deferThrow(
    `Encountered the same test key "${key}" twice. This may lead to tests overriding each other's results, or to tests being unexpectedly omitted.`
  );
}

export function useAvailableSuiteRoot(): Isolate | null {
  const root = useRuntimeRoot();

  if (root) {
    return root;
  }

  const [historyRoot] = useHistoryRoot();

  return historyRoot;
}
