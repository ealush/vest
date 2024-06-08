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
  // @vx-allow use-use (TODO: fix this. the error is in the lint rule)
  const summary = TestWalker.reduceTests<
    SuiteSummary<F, G>,
    TIsolateTest<F, G>
  >((summary, testObject) => {
    const fieldName = VestTest.getData<F>(testObject).fieldName;
    summary.tests[fieldName] = useAppendToTest(summary.tests, testObject);
    summary.groups = useAppendToGroup(summary.groups, testObject);

    if (VestTest.isOmitted(testObject)) {
      return summary;
    }
    if (summary.tests[fieldName].valid === false) {
      summary.valid = false;
    }
    return addSummaryStats(testObject, summary);
  }, new SuiteSummary());

  summary.valid = summary.valid === false ? false : useShouldAddValidProperty();

  return summary;
}

function addSummaryStats<F extends TFieldName, G extends TGroupName>(
  testObject: TIsolateTest<F, G>,
  summary: SuiteSummary<F, G>,
): SuiteSummary<F, G> {
  if (VestTest.isWarning(testObject)) {
    summary.warnCount++;
    summary.warnings.push(SummaryFailure.fromTestObject(testObject));
  } else if (VestTest.isFailing(testObject)) {
    summary.errorCount++;
    summary.errors.push(SummaryFailure.fromTestObject(testObject));
  }

  if (VestTest.isPending(testObject)) {
    summary.pendingCount++;
  }

  if (!VestTest.isNonActionable(testObject)) {
    summary.testCount++;
  }

  return summary;
}

function useAppendToTest<F extends TFieldName>(
  tests: Tests<F>,
  testObject: TIsolateTest<F>,
): SingleTestSummary {
  const fieldName = VestTest.getData<F>(testObject).fieldName;

  const test = appendTestObject(tests[fieldName], testObject);
  // If `valid` is false to begin with, keep it that way. Otherwise, assess.
  test.valid =
    test.valid === false ? false : useShouldAddValidProperty(fieldName);

  return test;
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

  groups[groupName] = groups[groupName] || {};
  const group = groups[groupName];
  group[fieldName] = appendTestObject(group[fieldName], testObject);

  group[fieldName].valid =
    group[fieldName].valid === false
      ? false
      : useShouldAddValidPropertyInGroup(groupName, fieldName);

  return groups;
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
