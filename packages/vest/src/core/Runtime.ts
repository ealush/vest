import { Isolate, VestRuntime } from 'vest-runtime';
import {
  BusType,
  CacheApi,
  TinyState,
  cache,
  seq,
  tinyState,
} from 'vest-utils';

import { Events } from 'BusEvents';
import {
  SuiteName,
  SuiteResult,
  TFieldName,
  TGroupName,
} from 'SuiteResultTypes';
import { useInitVestBus } from 'VestBus';

export type DoneCallback = (res: SuiteResult<TFieldName, TGroupName>) => void;
type FieldCallbacks = Record<string, DoneCallbacks>;
type DoneCallbacks = Array<DoneCallback>;

type StateExtra = {
  Bus: BusType;
  historyRoot: TinyState<Isolate | null>;
  doneCallbacks: TinyState<DoneCallbacks>;
  fieldCallbacks: TinyState<FieldCallbacks>;
  suiteName: string | undefined;
  suiteId: string;
  suiteResultCache: CacheApi<SuiteResult<TFieldName, TGroupName>>;
};
const suiteResultCache = cache<SuiteResult<TFieldName, TGroupName>>();

export function useCreateVestState({
  suiteName,
}: {
  suiteName?: SuiteName;
} = {}) {
  const stateRef: StateExtra = {
    Bus: useInitVestBus(),
    doneCallbacks: tinyState.createTinyState<DoneCallbacks>(() => []),
    fieldCallbacks: tinyState.createTinyState<FieldCallbacks>(() => ({})),
    // TODO: Need to move this one directly to vest-runtime
    // The reason that it is currently here is beacuse this vestState
    // is the persistent reference, and this object is the actual
    // object that persists between suite runs.
    // What we need to do is define a new type of contract between
    // vest-runtime and vest-core, where vest will pass the reference object
    // to vest-runtime, and vest-runtime will seal it to prevent future
    // modifications.
    historyRoot: tinyState.createTinyState<Isolate | null>(null),
    suiteId: seq(),
    suiteName,
    suiteResultCache,
  };

  return VestRuntime.createRef(stateRef);
}

export function useBus() {
  return useX().Bus;
}

/*
  Returns an emitter, but it also has a shortcut for emitting an event immediately
  by passing an event name.
*/
export function useEmit() {
  return VestRuntime.persist(useBus().emit);
}

export function usePrepareEmitter<T = void>(event: Events): (arg: T) => void {
  const emit = useEmit();

  return (arg: T) => emit(event, arg);
}

function useX() {
  return VestRuntime.useXAppData<StateExtra>();
}

export function useDoneCallbacks() {
  return useX().doneCallbacks();
}

export function useFieldCallbacks() {
  return useX().fieldCallbacks();
}

export function useSuiteName() {
  return useX().suiteName;
}

export function useSuiteId() {
  return useX().suiteId;
}

export function useSuiteResultCache<F extends TFieldName, G extends TGroupName>(
  action: () => SuiteResult<F, G>
): SuiteResult<F, G> {
  const suiteResultCache = useX().suiteResultCache;

  return suiteResultCache([useSuiteId()], action) as SuiteResult<F, G>;
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
  const [, , resetHistoryRoot] = VestRuntime.useHistoryRoot();

  resetHistoryRoot();
}
