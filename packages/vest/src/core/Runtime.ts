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
import { Severity } from 'Severity';
import {
  SuiteName,
  SuiteResult,
  TFieldName,
  TGroupName,
} from 'SuiteResultTypes';

export type DoneCallback = (res: SuiteResult<TFieldName, TGroupName>) => void;
type FieldCallbacks = Record<string, DoneCallbacks>;
type DoneCallbacks = Array<DoneCallback>;
type FailuresCache = {
  [Severity.ERRORS]: Record<TFieldName, TIsolate[]>;
  [Severity.WARNINGS]: Record<TFieldName, TIsolate[]>;
};
export type PreAggCache = {
  pending: TIsolate[];
  failures: FailuresCache;
};

type StateExtra = {
  doneCallbacks: TinyState<DoneCallbacks>;
  fieldCallbacks: TinyState<FieldCallbacks>;
  suiteName: Maybe<string>;
  suiteId: string;
  suiteResultCache: CacheApi<SuiteResult<TFieldName, TGroupName>>;
  preAggCache: CacheApi<PreAggCache>;
};
const suiteResultCache = cache<SuiteResult<TFieldName, TGroupName>>();
const preAggCache = cache<PreAggCache>();

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
    preAggCache,
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

export function usePreAggCache(action: CB<PreAggCache>) {
  const preAggCache = useX().preAggCache;

  return preAggCache([useSuiteId()], action);
}

export function useExpireSuiteResultCache() {
  const suiteResultCache = useX().suiteResultCache;
  suiteResultCache.invalidate([useSuiteId()]);

  // whenever we invalidate the entire result, we also want to invalidate the preagg cache
  // so that we do not get stale results there.
  // there may be a better place to do this, but for now, this should work.
  preAggCache.invalidate([useSuiteId()]);
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
