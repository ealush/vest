import { freezeAssign } from 'vest-utils';

import { useProduceSuiteSummary } from './selectors/useProduceSuiteSummary';

import { useSuiteName, useSuiteResultCache } from '@/core/Runtime';
import {
  SuiteResult,
  TFieldName,
  TGroupName,
} from '@/suiteResult/SuiteResultTypes';
import { suiteSelectors } from '@/suiteResult/selectors/suiteSelectors';

export function useCreateSuiteResult<
  F extends TFieldName,
  G extends TGroupName,
>(): SuiteResult<F, G> {
  return useSuiteResultCache<F, G>(() => {
    // @vx-allow use-use
    const summary = useProduceSuiteSummary<F, G>();

    // @vx-allow use-use
    const suiteName = useSuiteName();
    return freezeAssign<SuiteResult<F, G>>(
      summary,
      suiteSelectors<F, G>(summary),
      {
        suiteName,
      },
    ) as SuiteResult<F, G>;
  });
}
