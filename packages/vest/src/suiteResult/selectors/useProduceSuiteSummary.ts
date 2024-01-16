import { Maybe, assign, defaultTo } from 'vest-utils';

import { TIsolateTest } from 'IsolateTest';
import { countKeyBySeverity, Severity } from 'Severity';
import {
  Groups,
  SingleTestSummary,
  SuiteSummary,
  SummaryBase,
  TFieldName,
  TGroupName,
  Tests,
} from 'SuiteResultTypes';
import { SummaryFailure } from 'SummaryFailure';
import { TestWalker } from 'TestWalker';
import { VestTest } from 'VestTest';
import {
  useShouldAddValidProperty,
  useShouldAddValidPropertyInGroup,
} from 'shouldAddValidProperty';

export function useProduceSuiteSummary<
  F extends TFieldName,
  G extends TGroupName,
>(): SuiteSummary<F, G> {
  const summary: SuiteSummary<F, G> = new SuiteSummary();

  TestWalker.walkTests<F, G>(testObject => {
    summary.tests = useAppendToTest(summary.tests, testObject);
    summary.groups = useAppendToGroup(summary.groups, testObject);
    summary.errors = appendFailures(
      Severity.ERRORS,
      summary.errors,
      testObject,
    );
    summary.warnings = appendFailures(
      Severity.WARNINGS,
      summary.warnings,
      testObject,
    );
  });

  summary.valid = useShouldAddValidProperty();

  return countOverallStates(summary);
}

function appendFailures<F extends TFieldName, G extends TGroupName>(
  key: Severity,
  failures: SummaryFailure<F, G>[],
  testObject: TIsolateTest<F, G>,
): SummaryFailure<F, G>[] {
  if (VestTest.isOmitted(testObject)) {
    return failures;
  }

  const shouldAppend =
    key === Severity.WARNINGS
      ? VestTest.isWarning(testObject)
      : VestTest.isFailing(testObject);

  if (shouldAppend) {
    return failures.concat(SummaryFailure.fromTestObject(testObject));
  }
  return failures;
}

function useAppendToTest<F extends TFieldName>(
  tests: Tests<F>,
  testObject: TIsolateTest<F>,
): Tests<F> {
  const fieldName = VestTest.getData<F>(testObject).fieldName;

  const newTests = {
    ...tests,
  };

  newTests[fieldName] = appendTestObject(newTests[fieldName], testObject);
  // If `valid` is false to begin with, keep it that way. Otherwise, assess.
  newTests[fieldName].valid =
    newTests[fieldName].valid === false
      ? false
      : useShouldAddValidProperty(fieldName);

  return newTests;
}

/**
 * Appends to a group object if within a group
 */
function useAppendToGroup(
  groups: Groups<TGroupName, TFieldName>,
  testObject: TIsolateTest,
): Groups<TGroupName, TFieldName> {
  const { groupName, fieldName } = VestTest.getData(testObject);

  if (!groupName) {
    return groups;
  }

  const newGroups = {
    ...groups,
  };

  newGroups[groupName] = newGroups[groupName] || {};
  newGroups[groupName][fieldName] = appendTestObject(
    newGroups[groupName][fieldName],
    testObject,
  );

  newGroups[groupName][fieldName].valid =
    newGroups[groupName][fieldName].valid === false
      ? false
      : useShouldAddValidPropertyInGroup(groupName, fieldName);

  return newGroups;
}

/**
 * Counts the failed tests and adds global counters
 */
function countOverallStates<F extends TFieldName, G extends TGroupName>(
  summary: SuiteSummary<F, G>,
): SuiteSummary<F, G> {
  for (const test in summary.tests) {
    summary.errorCount += summary.tests[test].errorCount;
    summary.warnCount += summary.tests[test].warnCount;
    summary.testCount += summary.tests[test].testCount;
    summary.pendingCount += summary.tests[test].pendingCount;
  }
  return summary;
}

/**
 * Appends the test to a results object.
 */
// eslint-disable-next-line max-statements, complexity
function appendTestObject(
  summaryKey: Maybe<SingleTestSummary>,
  testObject: TIsolateTest,
): SingleTestSummary {
  const { message } = VestTest.getData(testObject);

  // Let's first create a new object, so we don't mutate the original.
  const nextSummaryKey = defaultTo<SingleTestSummary>(
    summaryKey ? { ...summaryKey } : null,
    baseTestStats,
  );

  // If the test is not actionable, we don't need to append it to the summary.
  if (VestTest.isNonActionable(testObject)) return nextSummaryKey;

  // Increment the pending count if the test is pending.
  if (VestTest.isPending(testObject)) {
    nextSummaryKey.pendingCount++;
  }

  // Increment the error count if the test is failing.
  if (VestTest.isFailing(testObject)) {
    incrementFailures(Severity.ERRORS);
  } else if (VestTest.isWarning(testObject)) {
    // Increment the warning count if the test is warning.
    incrementFailures(Severity.WARNINGS);
  }

  // Increment the test count.
  nextSummaryKey.testCount++;

  return nextSummaryKey;

  // Helper function to increment the failure count.
  function incrementFailures(severity: Severity) {
    const countKey = countKeyBySeverity(severity);
    nextSummaryKey[countKey]++;
    if (message) {
      nextSummaryKey[severity] = (nextSummaryKey[severity] || []).concat(
        message,
      );
    }
  }
}

function baseTestStats() {
  return assign(new SummaryBase(), {
    errors: [],
    valid: true,
    warnings: [],
  });
}
