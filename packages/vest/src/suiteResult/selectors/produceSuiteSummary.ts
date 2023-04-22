import { assign, defaultTo } from 'vest-utils';

import { IsolateTest } from 'IsolateTest';
import { countKeyBySeverity, Severity } from 'Severity';
import {
  Groups,
  SingleTestSummary,
  SuiteSummary,
  SummaryFailure,
  TFieldName,
  TGroupName,
  Tests,
} from 'SuiteResultTypes';
import { TestWalker } from 'TestWalker';
import {
  useShouldAddValidProperty,
  useShouldAddValidPropertyInGroup,
} from 'shouldAddValidProperty';

export function useProduceSuiteSummary<
  F extends TFieldName,
  G extends TGroupName
>(): SuiteSummary<F, G> {
  const summary: SuiteSummary<F, G> = assign(baseStats(), {
    errors: [] as SummaryFailure<F, G>[],
    groups: {},
    tests: {},
    valid: false,
    warnings: [] as SummaryFailure<F, G>[],
  }) as SuiteSummary<F, G>;

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
  const shouldAppend =
    key === Severity.WARNINGS ? testObject.isWarning() : testObject.isFailing();

  if (shouldAppend) {
    return failures.concat({
      fieldName: testObject.fieldName,
      groupName: testObject.groupName,
      message: testObject.message,
    });
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
  summaryKey: SingleTestSummary | undefined,
  testObject: IsolateTest
): SingleTestSummary {
  const { message } = testObject;

  const nextSummaryKey = defaultTo<SingleTestSummary>(
    summaryKey ? { ...summaryKey } : null,
    baseTestStats
  );

  if (testObject.isNonActionable()) return nextSummaryKey;

  nextSummaryKey.testCount++;

  if (testObject.isFailing()) {
    incrementFailures(Severity.ERRORS);
  } else if (testObject.isWarning()) {
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

function baseStats() {
  return {
    errorCount: 0,
    warnCount: 0,
    testCount: 0,
  };
}

function baseTestStats() {
  return assign(baseStats(), {
    errors: [],
    warnings: [],
    valid: true,
  });
}
