import {
  CB,
  CacheApi,
  Maybe,
  TinyState,
  cache,
  seq,
  tinyState,
} from 'vest-utils';
import { IRecociler, TIsolate, VestRuntime } from 'vestjs-runtime';

import { TIsolateSuite } from 'IsolateSuite';
import {
  SuiteName,
  SuiteResult,
  TFieldName,
  TGroupName,
} from 'SuiteResultTypes';

export type DoneCallback = (res: SuiteResult<TFieldName, TGroupName>) => void;
type FieldCallbacks = Record<string, DoneCallbacks>;
type DoneCallbacks = Array<DoneCallback>;

type StateExtra = {
  doneCallbacks: TinyState<DoneCallbacks>;
  fieldCallbacks: TinyState<FieldCallbacks>;
  suiteName: Maybe<string>;
  suiteId: string;
  suiteResultCache: CacheApi<SuiteResult<TFieldName, TGroupName>>;
  pendingCache: CacheApi<TIsolate[]>;
};
const suiteResultCache = cache<SuiteResult<TFieldName, TGroupName>>();
const pendingCache = cache<TIsolate[]>();

export function useCreateVestState({
  suiteName,
  VestReconciler,
}: {
  suiteName?: SuiteName;
  VestReconciler: IRecociler;
}) {
  const stateRef: StateExtra = {
    doneCallbacks: tinyState.createTinyState<DoneCallbacks>(() => []),
    fieldCallbacks: tinyState.createTinyState<FieldCallbacks>(() => ({})),
    pendingCache,
    suiteId: seq(),
    suiteName,
    suiteResultCache,
  };

  return VestRuntime.createRef(VestReconciler, stateRef);
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
  action: CB<SuiteResult<F, G>>,
): SuiteResult<F, G> {
  const suiteResultCache = useX().suiteResultCache;

  return suiteResultCache([useSuiteId()], action) as SuiteResult<F, G>;
}

export function usePendingCache(action: CB<TIsolate[]>) {
  const pendingCache = useX().pendingCache;

  return pendingCache([useSuiteId()], action);
}

export function useExpireSuiteResultCache() {
  const suiteResultCache = useX().suiteResultCache;
  suiteResultCache.invalidate([useSuiteId()]);

  // whenever we invalidate the entire result, we also want to invalidate the pending cache
  // so that we do not get stale results there.
  // there may be a better place to do this, but for now, this should work.
  pendingCache.invalidate([useSuiteId()]);
}

export function useResetCallbacks() {
  const [, , resetDoneCallbacks] = useDoneCallbacks();
  const [, , resetFieldCallbacks] = useFieldCallbacks();

  resetDoneCallbacks();
  resetFieldCallbacks();
}

export function useResetSuite() {
  useResetCallbacks();
  VestRuntime.reset();
}

export function useLoadSuite(rootNode: TIsolateSuite): void {
  VestRuntime.useLoadRootNode(rootNode);
  useExpireSuiteResultCache();
}
