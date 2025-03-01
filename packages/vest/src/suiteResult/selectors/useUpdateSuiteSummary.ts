import { isNotEmpty, isNotNullish } from 'vest-utils';

import { TIsolateTest } from 'IsolateTest';
import { useSummary } from 'SuiteContext';
import { SuiteSummary, TFieldName, TGroupName } from 'SuiteResultTypes';
import { VestTest } from 'VestTest';
import { baseTestStats, shouldCountTestRun } from 'useProduceSuiteSummary';

// eslint-disable-next-line max-statements, complexity, max-lines-per-function
export function useUpdateSuiteSummary(
  test: TIsolateTest,
): SuiteSummary<TFieldName, TGroupName> {
  console.log(test);

  const summary = useSummary();

  const isCounted = shouldCountTestRun(test);

  if (!isCounted) {
    return summary;
  }

  const { fieldName, message, asyncTest } = VestTest.getData(test);
  const groupName = VestTest.getGroupName(test);
  const isKnown = summary.knownTests.has(test);

  summary.tests[fieldName] ??= baseTestStats();

  if (!isKnown) {
    summary.testCount++;
    summary.tests[fieldName].testCount++;
  }

  if (groupName) {
    summary.groups[groupName] ??= {};
    summary.groups[groupName][fieldName] ??= baseTestStats();

    if (!isKnown) {
      summary.groups[groupName][fieldName].testCount++;
    }
  }

  if (VestTest.isFailing(test)) {
    summary.errorCount++;
    summary.tests[fieldName].errorCount++;

    if (isNotEmpty(message)) {
      summary.tests[fieldName].errors.push(message as string);
    }

    if (groupName) {
      if (isNotEmpty(message)) {
        summary.groups[groupName][fieldName].errors.push(message as string);
      }
      summary.groups[groupName][fieldName].errorCount++;
    }
  } else if (VestTest.isWarning(test)) {
    summary.warnCount++;
    summary.tests[fieldName].warnCount++;

    if (isNotEmpty(message)) {
      summary.tests[fieldName].warnings.push(message as string);
    }

    if (groupName) {
      if (isNotEmpty(message)) {
        summary.groups[groupName][fieldName].warnings.push(message as string);
      }
      summary.groups[groupName][fieldName].warnCount++;
    }
  }

  if (VestTest.isPending(test)) {
    summary.pendingCount++;
    summary.tests[fieldName].pendingCount++;
    if (groupName) {
      summary.groups[groupName][fieldName].pendingCount++;
    }
  } else if (isNotNullish(asyncTest)) {
    summary.pendingCount--;
    summary.tests[fieldName].pendingCount--;
    if (groupName) {
      summary.groups[groupName][fieldName].pendingCount--;
    }
  }

  return summary;
}
