import { suiteSelectors, SuiteSelectors } from 'suiteSelectors';
import { assign } from 'vest-utils';

import { SuiteSummary } from 'SuiteResultTypes';
import { produceSuiteSummary } from 'produceSuiteSummary';

export function suiteResult(): SuiteResult {
  const summary = produceSuiteSummary();
  return assign(summary, suiteSelectors(summary));
}

export type SuiteResult = SuiteSummary & SuiteSelectors;
