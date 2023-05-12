import { assign } from 'vest-utils';

import { useSuiteName } from 'PersistedContext';
import { SuiteResult, TFieldName, TGroupName } from 'SuiteResultTypes';
import { useProduceSuiteSummary } from 'produceSuiteSummary';
import { suiteSelectors } from 'suiteSelectors';

export function useCreateSuiteResult<
  F extends TFieldName,
  G extends TGroupName
>(): SuiteResult<F, G> {
  const summary = useProduceSuiteSummary<F, G>();
  const suiteName = useSuiteName();

  return Object.freeze(
    assign({ suiteName }, summary, suiteSelectors<F, G>(summary))
  );
}
