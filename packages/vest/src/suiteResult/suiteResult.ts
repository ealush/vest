import { assign, freezeAssign, Maybe } from 'vest-utils';
import { VestRuntime } from 'vestjs-runtime';

import { TIsolateSuite } from 'IsolateSuite';
import { useSuiteName, useSuiteResultCache } from 'Runtime';
import {
  SuiteResult,
  SuiteSummary,
  TFieldName,
  TGroupName,
} from 'SuiteResultTypes';
import { suiteSelectors } from 'suiteSelectors';
import { useProduceSuiteSummary } from 'useProduceSuiteSummary';

export function useCreateSuiteResult<
  F extends TFieldName,
  G extends TGroupName,
>(): SuiteResult<F, G> {
  return useSuiteResultCache<F, G>(() => {
    // @vx-allow use-use
    const summary = useProduceSuiteSummary<F, G>();

    // @vx-allow use-use
    const suiteName = useSuiteName();

    return freezeAssign(constructSuiteResultObject<F, G>(summary, suiteName), {
      dump: VestRuntime.persist(VestRuntime.useAvailableRoot<TIsolateSuite>),
    }) as SuiteResult<F, G>;
  });
}

export function constructSuiteResultObject<
  F extends TFieldName,
  G extends TGroupName,
>(summary: SuiteSummary<F, G>, suiteName?: Maybe<string>): SuiteResult<F, G> {
  return assign(summary, suiteSelectors<F, G>(summary), {
    suiteName,
  }) as SuiteResult<F, G>;
}
