import { assign } from 'vest-utils';

import { SuiteResult } from 'SuiteResultTypes';
import { produceSuiteSummary } from 'produceSuiteSummary';
import { suiteSelectors } from 'suiteSelectors';

export function suiteResult(): SuiteResult {
  const summary = produceSuiteSummary();
  return assign(summary, suiteSelectors(summary));
}
