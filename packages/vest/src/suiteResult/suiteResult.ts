import { assign } from 'vest-utils';

import { useSuiteName, useSuiteResultCache } from 'PersistedContext';
import { SuiteResult } from 'SuiteResultTypes';
import { produceSuiteSummary } from 'produceSuiteSummary';
import { suiteSelectors } from 'suiteSelectors';

export function createSuiteResult(): SuiteResult {
  const summary = produceSuiteSummary();
  const suiteName = useSuiteName();

  return useSuiteResultCache(() =>
    assign(summary, suiteSelectors(summary), { suiteName })
  );
}
