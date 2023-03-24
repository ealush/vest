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
  text,
} from 'vest-utils';

import { ErrorStrings } from 'ErrorStrings';
import type { IsolateSuite } from 'IsolateSuite';
import { SuiteName, SuiteResult, TFieldName } from 'SuiteResultTypes';
import { Events, useInitVestBus } from 'VestBus';
import { Isolate } from 'isolate';

const suiteResultCache = cache<SuiteResult<TFieldName>>();

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
        runtimeNode: null,
        runtimeRoot: null,
      },
      vestState
    );

    return ctxRef;
  }
);

export function useCreateVestState({
  suiteName,
}: {
  suiteName?: SuiteName;
} = {}): StateType {
  const stateRef: StateType = {
    VestBus: useInitVestBus(),
    doneCallbacks: tinyState.createTinyState<DoneCallbacks>(() => []),
    fieldCallbacks: tinyState.createTinyState<FieldCallbacks>(() => ({})),
    historyRoot: tinyState.createTinyState<Isolate | null>(null),
    suiteId: seq(),
    suiteName,
    suiteResultCache,
  };

  return stateRef;
}

export function persist<T extends CB>(cb: T): T {
  const prev = PersistedContext.useX();

  return function persisted(...args: Parameters<T>): ReturnType<T> {
    const ctxToUse = PersistedContext.use() ?? prev;
    return PersistedContext.run(ctxToUse, () => cb(...args));
  } as T;
}

export function useSuiteResultCache(action: () => SuiteResult<TFieldName>) {
  const suiteResultCache = useX().suiteResultCache;

  return suiteResultCache([useSuiteId()], action);
}

export function useExpireSuiteResultCache() {
  const suiteResultCache = useX().suiteResultCache;
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
  VestBus: BusType;
  suiteResultCache: CacheApi<SuiteResult<TFieldName>>;
};

type FieldCallbacks = Record<string, DoneCallbacks>;
type DoneCallbacks = Array<DoneCallback>;

function useX(): CTXType {
  return PersistedContext.useX();
}

export function useVestBus() {
  return useX().VestBus;
}

/*
  Returns an emitter, but it also has a shortcut for emitting an event immediately
  by passing an event name.
*/
export function useEmit() {
  return persist(useVestBus().emit);
}

export function usePrepareEmitter<T = void>(event: Events): (arg: T) => void {
  const emit = useEmit();

  return (arg: T) => emit(event, arg);
}

export type DoneCallback = (res: SuiteResult<TFieldName>) => void;

export function useDoneCallbacks() {
  return useX().doneCallbacks();
}

export function useFieldCallbacks() {
  return useX().fieldCallbacks();
}

export function useHistoryRoot() {
  return useX().historyRoot();
}

export function useHistoryNode() {
  return useX().historyNode;
}

export function useSuiteName() {
  return useX().suiteName;
}

export function useSuiteId() {
  return useX().suiteId;
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

  const historyNode = useX().historyNode;

  return historyNode?.keys[key] ?? null;
}

export function useIsolate() {
  return useX().runtimeNode ?? null;
}

export function useCurrentCursor() {
  return useIsolate()?.cursor() ?? 0;
}

export function useRuntimeRoot() {
  return useX().runtimeRoot;
}

export function useSetNextIsolateChild(child: Isolate): void {
  const currentIsolate = useIsolate();

  invariant(currentIsolate, ErrorStrings.NO_ACTIVE_ISOLATE);

  currentIsolate.addChild(child);
}

export function useSetIsolateKey(key: string | null, value: Isolate): void {
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

export function useAvailableSuiteRoot(): IsolateSuite | null {
  const root = useRuntimeRoot();

  if (root) {
    return root as IsolateSuite;
  }

  const [historyRoot] = useHistoryRoot();

  return historyRoot as IsolateSuite;
}
