import { assign } from 'vest-utils';

import { useSuiteName, useSuiteResultCache } from 'Runtime';
import { SuiteResult, TFieldName, TGroupName } from 'SuiteResultTypes';
import { suiteSelectors } from 'suiteSelectors';
import { useProduceSuiteSummary } from 'useProduceSuiteSummary';

export function useCreateSuiteResult<
  F extends TFieldName,
  G extends TGroupName
>(): SuiteResult<F, G> {
  return useSuiteResultCache<F, G>(() => {
    // @vx-allow use-use
    const summary = useProduceSuiteSummary<F, G>();

    // @vx-allow use-use
    const suiteName = useSuiteName();
    return Object.freeze(
      assign(summary, suiteSelectors<F, G>(summary), {
        suiteName,
      })
    ) as SuiteResult<F, G>;
  });
}
