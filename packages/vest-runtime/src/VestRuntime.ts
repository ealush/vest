// import type { Events } from 'BusEvents';
import { ErrorStrings } from 'ErrorStrings';

// import type { IsolateSuite } from 'IsolateSuite';
import { createCascade } from 'context';
import {
  invariant,
  deferThrow,
  isNullish,
  CB,
  assign,
  BusType,
  TinyState,
  text,
} from 'vest-utils';

import { Isolate } from 'Isolate';

// import {
//   SuiteName,
//   SuiteResult,
//   TFieldName,
//   TGroupName,
// } from 'SuiteResultTypes';
// import { useInitVestBus } from 'VestBus';

type CTXType = StateType & {
  historyNode: Isolate | null;
  runtimeNode: Isolate | null;
  runtimeRoot: Isolate | null;
};

type StateType = {
  historyRoot: TinyState<Isolate | null>;
  Bus: BusType;
  // doneCallbacks: TinyState<DoneCallbacks>;
  // fieldCallbacks: TinyState<FieldCallbacks>;
  // suiteName: string | undefined;
  // suiteId: string;
  // suiteResultCache: CacheApi<SuiteResult<TFieldName, TGroupName>>;
};

export const PersistedContext = createCascade<CTXType>(
  (state, parentContext) => {
    if (parentContext) {
      return null;
    }

    invariant(state.historyRoot);

    const [historyRootNode] = state.historyRoot();

    const ctxRef = {} as CTXType;

    assign(
      ctxRef,
      {
        historyNode: historyRootNode,
        runtimeNode: null,
        runtimeRoot: null,
      },
      state
    );

    return ctxRef;
  }
);
function persist<T extends CB>(cb: T): T {
  const prev = PersistedContext.useX();

  return ((...args: Parameters<T>): ReturnType<T> => {
    const ctxToUse = PersistedContext.use() ?? prev;
    return PersistedContext.run(ctxToUse, () => cb(...args));
  }) as T;
}
export function useX<T = object>(): CTXType & T {
  return PersistedContext.useX() as CTXType & T;
}
function useBus() {
  return useX().Bus;
}

/*
  Returns an emitter, but it also has a shortcut for emitting an event immediately
  by passing an event name.
*/
export function useEmit() {
  return persist(useBus().emit);
}
export function useHistoryRoot() {
  return useX().historyRoot();
}
export function useHistoryNode() {
  return useX().historyNode;
}
export function useSetHistory(history: Isolate) {
  const context = useX();

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
// function useAvailableSuiteRoot(): Isolate | null {
//   const root = useRuntimeRoot();

//   if (root) {
//     return root as Isolate;
//   }

//   const [historyRoot] = useHistoryRoot();

//   return historyRoot as Isolate;
// }

// export function useCreatestate({
//   suiteName,
// }: {
//   suiteName?: SuiteName;
// } = {}): StateType {
//   const stateRef: StateType = {
//     historyRoot: tinyState.createTinyState<Isolate | null>(null),
//     //Bus: useInitVestBus(),
//     // doneCallbacks: tinyState.createTinyState<DoneCallbacks>(() => []),
//     // fieldCallbacks: tinyState.createTinyState<FieldCallbacks>(() => ({})),
//     // suiteId: seq(),
//     // suiteName,
//     // suiteResultCache,
//   };

//   return stateRef;
// }

// ------------------
