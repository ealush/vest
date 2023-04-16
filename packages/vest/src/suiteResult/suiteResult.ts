import { assign } from 'vest-utils';

import { useSuiteName, useSuiteResultCache } from 'PersistedContext';
import { SuiteResult, TFieldName, TGroupName } from 'SuiteResultTypes';
import { useProduceSuiteSummary } from 'produceSuiteSummary';
import { suiteSelectors } from 'suiteSelectors';

export function useCreateSuiteResult<
  F extends TFieldName,
  G extends TGroupName
>(): SuiteResult<F, G> {
  const summary = useProduceSuiteSummary<F, G>();
  const suiteName = useSuiteName();

  return useSuiteResultCache<F, G>(
    () =>
      assign(summary, suiteSelectors<F, G>(summary), {
        suiteName,
      }) as SuiteResult<F, G>
  );
}
