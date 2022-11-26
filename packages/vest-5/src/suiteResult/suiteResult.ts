import { suiteSelectors } from 'suiteSelectors';
import { assign } from 'vest-utils';

import { useSuiteName } from 'PersistedContext';
import { SuiteResult } from 'SuiteResultTypes';
import { produceSuiteSummary } from 'produceSuiteSummary';

export function suiteResult(): SuiteResult {
  const summary = produceSuiteSummary();
  const suiteName = useSuiteName();
  return assign(summary, suiteSelectors(summary), { suiteName });
}
