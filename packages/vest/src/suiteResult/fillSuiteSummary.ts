import { useIsOptionalFieldApplied } from 'optional';

import { useGetSuiteSummary } from 'IsolateSuite';
import { TIsolateTest } from 'IsolateTest';
import { SummaryFailure } from 'SummaryFailure';
import { VestTest } from 'VestTest';
import { baseTestStats } from 'useProduceSuiteSummary';
import {
  useHasNonOptionalIncomplete,
  useNoMissingTests,
} from 'useSetValidProperty';

export function initSuiteSummary(): void {}

// eslint-disable-next-line max-statements, complexity, max-lines-per-function
export function useMarkCompletedTestInSummary(test: TIsolateTest): void {
  const summary = useGetSuiteSummary();
  const { fieldName, message } = VestTest.getData(test);
  useReducePendingTestFromSummary(test);
  const testSummary = summary.tests[fieldName];
  testSummary.valid =
    testSummary.valid === false ? false : useSetValidProperty(fieldName);
  if (!VestTest.hasFailures(test)) {
    return;
  }
  const groupName = VestTest.getGroupName(test);
  const summaryFailure = new SummaryFailure(fieldName, message, groupName);
  if (groupName) {
    summary.groups[groupName] = summary.groups[groupName] ?? {};
    summary.groups[groupName][fieldName] ??= baseTestStats();
    summary.groups[groupName][fieldName].testCount++;
  }
  if (VestTest.isWarning(test)) {
    testSummary.warnCount++;
    summary.warnCount++;
    if (message) {
      testSummary.warnings.push(message);
    }
    summary.warnings.push(summaryFailure);
    if (groupName) {
      summary.groups[groupName][fieldName].warnCount++;
      if (message) {
        summary.groups[groupName][fieldName].warnings.push(message);
      }
    }
    return;
  }
  testSummary.errorCount++;
  summary.errorCount++;
  if (message) {
    testSummary.errors.push(message);
  }
  if (groupName) {
    summary.groups[groupName][fieldName].errorCount++;
    if (message) {
      summary.groups[groupName][fieldName].errors.push(message);
    }
  }
  summary.errors.push(summaryFailure);
  testSummary.valid = false;
  summary.valid = false;
}

export function useAddTestToSummary(fieldName: string): void {
  const summary = useGetSuiteSummary();
  const testSummary = summary.tests[fieldName] ?? baseTestStats();
  summary.tests[fieldName] = testSummary;
  testSummary.testCount++;
  summary.testCount++;
}

export function useAddPendingTestToSummary(test: TIsolateTest): void {
  const summary = useGetSuiteSummary();
  const { fieldName } = VestTest.getData(test);
  const testSummary = summary.tests[fieldName];
  testSummary.pendingCount++;
  summary.pendingCount++;
}

function useReducePendingTestFromSummary(test: TIsolateTest): void {
  const summary = useGetSuiteSummary();
  if (!VestTest.isAsyncTest(test)) {
    return;
  }
  const { fieldName } = VestTest.getData(test);
  const testSummary = summary.tests[fieldName];
  testSummary.pendingCount--;
  summary.pendingCount--;
}

// eslint-disable-next-line complexity
function useSetValidProperty(fieldName?: string): boolean {
  const summary = useGetSuiteSummary();
  if (summary.testCount === 0) {
    return false;
  }
  if (useIsOptionalFieldApplied(fieldName)) {
    return true;
  }
  if (fieldName && summary.tests[fieldName].errorCount > 0) {
    return false;
  }
  if (useHasNonOptionalIncomplete(fieldName)) {
    return false;
  }
  return useNoMissingTests(fieldName);
}
