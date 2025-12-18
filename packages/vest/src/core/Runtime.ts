import { CB, CacheApi, TinyState, cache, seq, tinyState } from 'vest-utils';
import { IReconciler, VestRuntime } from 'vestjs-runtime';

import {
  SuiteResult,
  TFieldName,
  TGroupName,
  TSchema,
} from '../suiteResult/SuiteResultTypes';

import { TIsolateSuite } from './isolate/IsolateSuite/IsolateSuite';
import { reprocessTree } from './isolate/registerTests';

export type DoneCallback = (res: SuiteResult<TFieldName, TGroupName>) => void;
type FieldCallbacks = Record<string, DoneCallbacks>;

type DoneCallbacks = Array<DoneCallback>;

type StateExtra = {
  doneCallbacks: TinyState<DoneCallbacks>;
  fieldCallbacks: TinyState<FieldCallbacks>;
  suiteId: string;
  suiteResultCache: CacheApi<SuiteResult<TFieldName, TGroupName, TSchema>>;
};
const suiteResultCache = cache<SuiteResult<TFieldName, TGroupName, TSchema>>();

export function useCreateVestState({
  VestReconciler,
}: {
  VestReconciler: IReconciler;
}) {
  const stateRef: StateExtra = {
    doneCallbacks: tinyState.createTinyState<DoneCallbacks>(() => []),
    fieldCallbacks: tinyState.createTinyState<FieldCallbacks>(() => ({})),
    suiteId: seq(),
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

function useSuiteId() {
  return useX().suiteId;
}

export function useSuiteResultCache<
  F extends TFieldName,
  G extends TGroupName,
  S extends TSchema = undefined,
>(action: CB<SuiteResult<F, G, S>>): SuiteResult<F, G, S> {
  const suiteResultCache = useX().suiteResultCache;

  return suiteResultCache([useSuiteId()], action) as SuiteResult<F, G, S>;
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
  VestRuntime.reset();
}

export function useLoadSuite(rootNode: TIsolateSuite): void {
  VestRuntime.useSetHistoryRoot(rootNode);

  reprocessTree(rootNode);

  useExpireSuiteResultCache();
}
