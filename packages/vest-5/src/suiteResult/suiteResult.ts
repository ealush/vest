import { SuiteSummary } from 'SuiteResultTypes';
import { produceSuiteSummary } from 'produceSuiteSummary';

export function suiteResult(): SuiteResult {
  return produceSuiteSummary();
}

export type SuiteResult = SuiteSummary;
