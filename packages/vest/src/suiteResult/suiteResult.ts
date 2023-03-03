import { assign } from 'vest-utils';

import { useSuiteName, useSuiteResultCache } from 'PersistedContext';
import { SuiteResult, TFieldName } from 'SuiteResultTypes';
import { useProduceSuiteSummary } from 'produceSuiteSummary';
import { suiteSelectors } from 'suiteSelectors';

export function useCreateSuiteResult<F extends TFieldName>(): SuiteResult<F> {
  const summary = useProduceSuiteSummary();
  const suiteName = useSuiteName();

  return useSuiteResultCache(() =>
    assign(summary, suiteSelectors(summary), { suiteName })
  );
}
