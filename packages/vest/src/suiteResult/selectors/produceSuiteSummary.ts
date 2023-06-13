import { Maybe, assign, defaultTo } from 'vest-utils';

import { IsolateTest } from 'IsolateTest';
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
import { VestTestInspector } from 'VestTestInspector';
import {
  useShouldAddValidProperty,
  useShouldAddValidPropertyInGroup,
} from 'shouldAddValidProperty';

export function useProduceSuiteSummary<
  F extends TFieldName,
  G extends TGroupName
>(): SuiteSummary<F, G> {
  const summary: SuiteSummary<F, G> = new SuiteSummary();

  TestWalker.walkTests<F, G>(testObject => {
    summary.tests = useAppendToTest(summary.tests, testObject);
    summary.groups = useAppendToGroup(summary.groups, testObject);
    summary.errors = appendFailures(
      Severity.ERRORS,
      summary.errors,
      testObject
    );
    summary.warnings = appendFailures(
      Severity.WARNINGS,
      summary.warnings,
      testObject
    );
  });

  summary.valid = useShouldAddValidProperty();

  return countFailures(summary);
}

function appendFailures<F extends TFieldName, G extends TGroupName>(
  key: Severity,
  failures: SummaryFailure<F, G>[],
  testObject: IsolateTest<F, G>
): SummaryFailure<F, G>[] {
  if (VestTestInspector.isOmitted(testObject)) {
    return failures;
  }

  const shouldAppend =
    key === Severity.WARNINGS
      ? VestTestInspector.isWarning(testObject)
      : VestTestInspector.isFailing(testObject);

  if (shouldAppend) {
    return failures.concat(SummaryFailure.fromTestObject(testObject));
  }
  return failures;
}

function useAppendToTest<F extends TFieldName>(
  tests: Tests<F>,
  testObject: IsolateTest<F>
): Tests<F> {
  const { fieldName } = testObject;

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
  testObject: IsolateTest
): Groups<TGroupName, TFieldName> {
  const { groupName, fieldName } = testObject;

  if (!groupName) {
    return groups;
  }

  const newGroups = {
    ...groups,
  };

  newGroups[groupName] = newGroups[groupName] || {};
  newGroups[groupName][fieldName] = appendTestObject(
    newGroups[groupName][fieldName],
    testObject
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
function countFailures<F extends TFieldName, G extends TGroupName>(
  summary: SuiteSummary<F, G>
): SuiteSummary<F, G> {
  for (const test in summary.tests) {
    summary.errorCount += summary.tests[test].errorCount;
    summary.warnCount += summary.tests[test].warnCount;
    summary.testCount += summary.tests[test].testCount;
  }
  return summary;
}

/**
 * Appends the test to a results object.
 * Overload is only needed to satisfy typescript. No use in breaking it down to multiple
 * functions as it is really the same, with the difference of "valid" missing in groups
 */
function appendTestObject(
  summaryKey: Maybe<SingleTestSummary>,
  testObject: IsolateTest
): SingleTestSummary {
  const { message } = testObject;

  const nextSummaryKey = defaultTo<SingleTestSummary>(
    summaryKey ? { ...summaryKey } : null,
    baseTestStats
  );

  if (VestTestInspector.isNonActionable(testObject)) return nextSummaryKey;

  nextSummaryKey.testCount++;

  if (VestTestInspector.isFailing(testObject)) {
    incrementFailures(Severity.ERRORS);
  } else if (VestTestInspector.isWarning(testObject)) {
    incrementFailures(Severity.WARNINGS);
  }

  return nextSummaryKey;

  function incrementFailures(severity: Severity) {
    const countKey = countKeyBySeverity(severity);
    nextSummaryKey[countKey]++;
    if (message) {
      nextSummaryKey[severity] = (nextSummaryKey[severity] || []).concat(
        message
      );
    }
  }
}

function baseTestStats() {
  return assign(new SummaryBase(), {
    errors: [],
    warnings: [],
    valid: true,
  });
}
