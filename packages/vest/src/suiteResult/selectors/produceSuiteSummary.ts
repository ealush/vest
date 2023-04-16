import { assign, defaultTo } from 'vest-utils';

import { IsolateTest } from 'IsolateTest';
import { countKeyBySeverity, Severity } from 'Severity';
import {
  Groups,
  SingleTestSummary,
  SuiteSummary,
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
    groups: {},
    tests: {},
    valid: false,
  }) as SuiteSummary<F, G>;

  TestWalker.walkTests(testObject => {
    summary.tests = useAppendToTest(summary.tests, testObject);
    summary.groups = useAppendToGroup(summary.groups, testObject);
  });

  summary.valid = useShouldAddValidProperty();

  return countFailures(summary);
}

function useAppendToTest(
  tests: Tests<TFieldName>,
  testObject: IsolateTest
): Tests<TFieldName> {
  const newTests = {
    ...tests,
  };

  newTests[testObject.fieldName] = appendTestObject(
    newTests[testObject.fieldName],
    testObject
  );
  // If `valid` is false to begin with, keep it that way. Otherwise, assess.
  newTests[testObject.fieldName].valid =
    newTests[testObject.fieldName].valid === false
      ? false
      : useShouldAddValidProperty(testObject.fieldName);

  return newTests;
}

/**
 * Appends to a group object if within a group
 */
function useAppendToGroup(
  groups: Groups<TGroupName, TFieldName>,
  testObject: IsolateTest
): Groups<TGroupName, TFieldName> {
  const { groupName } = testObject;

  if (!groupName) {
    return groups;
  }

  const newGroups = {
    ...groups,
  };

  newGroups[groupName] = newGroups[groupName] || {};
  newGroups[groupName][testObject.fieldName] = appendTestObject(
    newGroups[groupName][testObject.fieldName],
    testObject
  );

  newGroups[groupName][testObject.fieldName].valid =
    newGroups[groupName][testObject.fieldName].valid === false
      ? false
      : useShouldAddValidPropertyInGroup(groupName, testObject.fieldName);

  return newGroups;
}

/**
 * Counts the failed tests and adds global counters
 */
function countFailures(
  summary: SuiteSummary<TFieldName, TGroupName>
): SuiteSummary<TFieldName, TGroupName> {
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
