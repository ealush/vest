import { SuiteSummary } from 'SuiteSymmaryTypes';

export function produceSuiteSummary(): SuiteSummary {
  return {
    errorCount: 0,
    groups: {},
    testCount: 0,
    tests: {},
    valid: false,
    warnCount: 0,
  };
}
