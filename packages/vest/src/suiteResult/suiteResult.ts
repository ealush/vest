import { assign, freezeAssign } from 'vest-utils';
import { VestRuntime } from 'vestjs-runtime';

import { TIsolateSuite } from '../core/isolate/IsolateSuite/IsolateSuite';
import { useSuiteResultCache } from '../core/Runtime';
import {
  SuiteResult,
  SuiteSummary,
  TFieldName,
  TGroupName,
} from './SuiteResultTypes';
import { suiteSelectors } from './selectors/suiteSelectors';
import { useProduceSuiteSummary } from './selectors/useProduceSuiteSummary';

export function useCreateSuiteResult<
  F extends TFieldName,
  G extends TGroupName,
>(): SuiteResult<F, G> {
  return useSuiteResultCache<F, G>(() => {
    // @vx-allow use-use
    const summary = useProduceSuiteSummary<F, G>();
    return freezeAssign(constructSuiteResultObject<F, G>(summary), {
      dump: VestRuntime.persist(VestRuntime.useAvailableRoot<TIsolateSuite>),
    }) as SuiteResult<F, G>;
  });
}

export function constructSuiteResultObject<
  F extends TFieldName,
  G extends TGroupName,
>(summary: SuiteSummary<F, G>): SuiteResult<F, G> {
  return assign(summary, suiteSelectors<F, G>(summary), {}) as SuiteResult<
    F,
    G
  >;
}
