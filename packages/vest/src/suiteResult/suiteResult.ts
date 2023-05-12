import { assign } from 'vest-utils';

import { useSuiteName, useSuiteResultCache } from 'PersistedContext';
import { SuiteResult, TFieldName, TGroupName } from 'SuiteResultTypes';
import { useProduceSuiteSummary } from 'produceSuiteSummary';
import { suiteSelectors } from 'suiteSelectors';

export function useCreateSuiteResult<
  F extends TFieldName,
  G extends TGroupName
>(): SuiteResult<F, G> {
  return useSuiteResultCache<F, G>(() => {
    // eslint-disable-next-line vest-internal/use-use
    const summary = useProduceSuiteSummary<F, G>();
    // eslint-disable-next-line vest-internal/use-use
    const suiteName = useSuiteName();
    return Object.freeze(
      assign(summary, suiteSelectors<F, G>(summary), {
        suiteName,
      })
    ) as SuiteResult<F, G>;
  });
}
