import {
  CB,
  CacheApi,
  Maybe,
  TinyState,
  cache,
  seq,
  tinyState,
} from 'vest-utils';
import { IRecociler, VestRuntime } from 'vestjs-runtime';

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
};
const suiteResultCache = cache<SuiteResult<TFieldName, TGroupName>>();

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
  action: CB<SuiteResult<F, G>>
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
  VestRuntime.reset();
}

export function useLoadSuite(rootNode: Record<string, any>): void {
  VestRuntime.useLoadRootNode(rootNode);
  useExpireSuiteResultCache();
}
