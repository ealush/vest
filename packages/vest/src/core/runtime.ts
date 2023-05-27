import { VestRuntime } from 'vest-runtime';
import { CacheApi, TinyState, cache } from 'vest-utils';

import { Events } from 'BusEvents';
import { SuiteResult, TFieldName, TGroupName } from 'SuiteResultTypes';

export type DoneCallback = (res: SuiteResult<TFieldName, TGroupName>) => void;
type FieldCallbacks = Record<string, DoneCallbacks>;
type DoneCallbacks = Array<DoneCallback>;

type StateExtra = {
  doneCallbacks: TinyState<DoneCallbacks>;
  fieldCallbacks: TinyState<FieldCallbacks>;
  suiteName: string | undefined;
  suiteId: string;
  suiteResultCache: CacheApi<SuiteResult<TFieldName, TGroupName>>;
};
const suiteResultCache = cache<SuiteResult<TFieldName, TGroupName>>();

export function usePrepareEmitter<T = void>(event: Events): (arg: T) => void {
  const emit = VestRuntime.useEmit();

  return (arg: T) => emit(event, arg);
}

function useX() {
  return VestRuntime.useX<StateExtra>();
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
