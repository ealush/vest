import { assign } from 'vest-utils';

import { SuiteSummary } from 'SuiteResultTypes';
import { produceSuiteSummary } from 'produceSuiteSummary';
import { suiteSelectors, SuiteSelectors } from 'suiteSelectors';

export function suiteResult(): SuiteResult {
  const summary = produceSuiteSummary();
  return assign(summary, suiteSelectors(summary));
}

export type SuiteResult = SuiteSummary & SuiteSelectors;
