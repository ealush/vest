// import type { Events } from 'BusEvents';
import { ErrorStrings } from 'ErrorStrings';
// import type { IsolateSuite } from 'IsolateSuite';
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

import { Isolate } from 'Isolate';
// import {
//   SuiteName,
//   SuiteResult,
//   TFieldName,
//   TGroupName,
// } from 'SuiteResultTypes';
// import { useInitVestBus } from 'VestBus';

type CTXType<T> = StateType<T> & {
  historyNode: Isolate | null;
  runtimeNode: Isolate | null;
  runtimeRoot: Isolate | null;
};

type StateType<T> = T & {
  historyRoot: TinyState<Isolate | null>;
  Bus: BusType;
  // doneCallbacks: TinyState<DoneCallbacks>;
  // fieldCallbacks: TinyState<FieldCallbacks>;
  // suiteName: string | undefined;
  // suiteId: string;
  // suiteResultCache: CacheApi<SuiteResult<TFieldName, TGroupName>>;
};

// eslint-disable-next-line max-lines-per-function, max-statements
export class VestRuntime<T extends Record<string, any>> {
  PersistedContext = createCascade<CTXType<T>>((state, parentContext) => {
    if (parentContext) {
      return null;
    }

    invariant(state.historyRoot);

    const [historyRootNode] = state.historyRoot();

    const ctxRef = {} as CTXType<T>;

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
  });
  persist<T extends CB>(cb: T): T {
    const prev = this.PersistedContext.useX();

    return ((...args: Parameters<T>): ReturnType<T> => {
      const ctxToUse = this.PersistedContext.use() ?? prev;
      return this.PersistedContext.run(ctxToUse, () => cb(...args));
    }) as T;
  }
  useX(): CTXType<T> {
    return this.PersistedContext.useX();
  }
  useBus() {
    return this.useX().Bus;
  }

  /*
  Returns an emitter, but it also has a shortcut for emitting an event immediately
  by passing an event name.
*/ useEmit() {
    return this.persist(this.useBus().emit);
  }
  useHistoryRoot() {
    return this.useX().historyRoot();
  }
  useHistoryNode() {
    return this.useX().historyNode;
  }
  useSetHistory(history: Isolate) {
    const context = this.PersistedContext.useX();

    const [, setHistoryRoot] = context.historyRoot();
    setHistoryRoot(history);
  }
  useHistoryKey(key?: string | null): Isolate | null {
    if (isNullish(key)) {
      return null;
    }

    const historyNode = this.useX().historyNode;

    return historyNode?.keys[key] ?? null;
  }
  useIsolate() {
    return this.useX().runtimeNode ?? null;
  }
  useCurrentCursor() {
    return this.useIsolate()?.cursor() ?? 0;
  }
  useRuntimeRoot() {
    return this.useX().runtimeRoot;
  }
  useSetNextIsolateChild(child: Isolate): void {
    const currentIsolate = this.useIsolate();

    invariant(currentIsolate, ErrorStrings.NO_ACTIVE_ISOLATE);

    currentIsolate.addChild(child);
  }
  useSetIsolateKey(key: string | null, value: Isolate): void {
    if (!key) {
      return;
    }

    const currentIsolate = this.useIsolate();

    invariant(currentIsolate, ErrorStrings.NO_ACTIVE_ISOLATE);

    if (isNullish(currentIsolate.keys[key])) {
      currentIsolate.keys[key] = value;

      return;
    }

    deferThrow(text(ErrorStrings.ENCOUNTERED_THE_SAME_KEY_TWICE, { key }));
  }
  useAvailableSuiteRoot(): Isolate | null {
    const root = this.useRuntimeRoot();

    if (root) {
      return root as Isolate;
    }

    const [historyRoot] = this.useHistoryRoot();

    return historyRoot as Isolate;
  }
}

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

// const suiteResultCache = cache<SuiteResult<TFieldName, TGroupName>>();

// type FieldCallbacks = Record<string, DoneCallbacks>;
// type DoneCallbacks = Array<DoneCallback>;

// export function usePrepareEmitter<T = void>(event: Events): (arg: T) => void {
//   const emit = useEmit();

//   return (arg: T) => emit(event, arg);
// }

// export type DoneCallback = (res: SuiteResult<TFieldName, TGroupName>) => void;

// export function useDoneCallbacks() {
//   return useX().doneCallbacks();
// }

// export function useFieldCallbacks() {
//   return useX().fieldCallbacks();
// }

// export function useSuiteName() {
//   return useX().suiteName;
// }

// export function useSuiteId() {
//   return useX().suiteId;
// }

// export function useSuiteResultCache<F extends TFieldName, G extends TGroupName>(
//   action: () => SuiteResult<F, G>
// ): SuiteResult<F, G> {
//   const suiteResultCache = useX().suiteResultCache;

//   return suiteResultCache([useSuiteId()], action) as SuiteResult<F, G>;
// }

// export function useExpireSuiteResultCache() {
//   const suiteResultCache = useX().suiteResultCache;
//   suiteResultCache.invalidate([useSuiteId()]);
// }

// export function useResetCallbacks() {
//   const [, , resetDoneCallbacks] = useDoneCallbacks();
//   const [, , resetFieldCallbacks] = useFieldCallbacks();

//   resetDoneCallbacks();
//   resetFieldCallbacks();
// }

// export function useResetSuite() {
//   useResetCallbacks();
//   const [, , resetHistoryRoot] = useHistoryRoot();

//   resetHistoryRoot();
// }
