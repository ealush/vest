import { CB, CacheApi, TinyState, cache, seq, tinyState } from 'vest-utils';
import { IReconciler, VestRuntime } from 'vestjs-runtime';

import {
  SuiteResult,
  TFieldName,
  TGroupName,
  TSchema,
} from '../suiteResult/SuiteResultTypes';

import { TIsolateSuite } from './isolate/IsolateSuite/IsolateSuite';
import { useReprocessTree } from './isolate/registerTests';

export type DoneCallback = (res: SuiteResult<TFieldName, TGroupName>) => void;
type FieldCallbacks = Record<string, DoneCallbacks>;

type DoneCallbacks = Array<DoneCallback>;

type StateExtra = {
  doneCallbacks: TinyState<DoneCallbacks>;
  fieldCallbacks: TinyState<FieldCallbacks>;
  parsedDataCache: TinyState<Record<string, unknown>>;
  suiteId: string;
  suiteResultCache: CacheApi<SuiteResult<TFieldName, TGroupName, TSchema>>;
};
const createSuiteResultCache = () =>
  cache<SuiteResult<TFieldName, TGroupName, TSchema>>();

export function useCreateVestState({
  VestReconciler,
}: {
  VestReconciler: IReconciler;
}) {
  const stateRef: StateExtra = {
    doneCallbacks: tinyState.createTinyState<DoneCallbacks>(() => []),
    fieldCallbacks: tinyState.createTinyState<FieldCallbacks>(() => ({})),
    parsedDataCache: tinyState.createTinyState<Record<string, unknown>>(
      () => ({}),
    ),
    suiteId: seq(),
    suiteResultCache: createSuiteResultCache(),
  };

  return VestRuntime.createRef(VestReconciler, stateRef);
}

function useVestState() {
  return VestRuntime.useXAppData<StateExtra>();
}

export function useDoneCallbacks() {
  return useVestState().doneCallbacks();
}

export function useFieldCallbacks() {
  return useVestState().fieldCallbacks();
}

function useSuiteId() {
  return useVestState().suiteId;
}

export function useParsedDataCache() {
  return useVestState().parsedDataCache();
}

export function useSuiteResultCache<
  F extends TFieldName,
  G extends TGroupName,
  S extends TSchema = undefined,
  D = unknown,
>(action: CB<SuiteResult<F, G, S, D>>): SuiteResult<F, G, S, D> {
  const suiteResultCache = useVestState().suiteResultCache;

  return suiteResultCache([useSuiteId()], action) as SuiteResult<F, G, S, D>;
}

export function usePreviousSuiteResult<
  F extends TFieldName,
  G extends TGroupName,
  S extends TSchema = undefined,
  D = unknown,
>(): SuiteResult<F, G, S, D> | undefined {
  const suiteResultCache = useVestState().suiteResultCache;
  return suiteResultCache.get([useSuiteId()])?.[1] as unknown as
    | SuiteResult<F, G, S, D>
    | undefined;
}

export function useExpireSuiteResultCache() {
  const suiteResultCache = useVestState().suiteResultCache;
  suiteResultCache.invalidate([useSuiteId()]);
}

export function useResetCallbacks() {
  const [, , resetDoneCallbacks] = useDoneCallbacks();
  const [, , resetFieldCallbacks] = useFieldCallbacks();

  resetDoneCallbacks();
  resetFieldCallbacks();
}

export function useResetSuite() {
  const [, , resetParsedData] = useParsedDataCache();
  useExpireSuiteResultCache();
  useResetCallbacks();
  resetParsedData();
  VestRuntime.reset();
}

export function useLoadSuite(rootNode: TIsolateSuite): void {
  VestRuntime.useSetHistoryRoot(rootNode);

  useReprocessTree(rootNode);

  useExpireSuiteResultCache();
}
