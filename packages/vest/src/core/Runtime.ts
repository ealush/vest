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

import { TIsolateSuite } from 'IsolateSuite';
import {
  SuiteName,
  SuiteResult,
  TFieldName,
  TGroupName,
} from 'SuiteResultTypes';
import { reprocessTree } from 'registerTests';

// Import schema-related types from n4s
import type { RuleInstance } from 'n4s';

export type DoneCallback = (res: SuiteResult<TFieldName, TGroupName>) => void;
type FieldCallbacks = Record<string, DoneCallbacks>;

type DoneCallbacks = Array<DoneCallback>;

type StateExtra = {
  doneCallbacks: TinyState<DoneCallbacks>;
  fieldCallbacks: TinyState<FieldCallbacks>;
  suiteName: Maybe<string>;
  suiteId: string;
  suiteResultCache: CacheApi<SuiteResult<TFieldName, TGroupName>>;
  suiteSchema?: RuleInstance<any>;
};
const suiteResultCache = cache<SuiteResult<TFieldName, TGroupName>>();

export function useCreateVestState({
  suiteName,
  VestReconciler,
  suiteSchema,
}: {
  suiteName?: SuiteName;
  VestReconciler: IRecociler;
  suiteSchema?: RuleInstance<any>;
}) {
  const stateRef: StateExtra = {
    doneCallbacks: tinyState.createTinyState<DoneCallbacks>(() => []),
    fieldCallbacks: tinyState.createTinyState<FieldCallbacks>(() => ({})),
    suiteId: seq(),
    suiteName,
    suiteResultCache,
    suiteSchema,
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

export function useSuiteSchema() {
  return useX().suiteSchema;
}

function useSuiteId() {
  return useX().suiteId;
}

export function useSuiteResultCache<
  F extends TFieldName,
  G extends TGroupName,
  S extends RuleInstance<any> | undefined = undefined,
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
