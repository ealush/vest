import { assign } from 'vest-utils';

import { IsolateTest } from 'IsolateTest';
import { countKeyBySeverity, Severity } from 'Severity';
import {
  Group,
  Groups,
  SingleTestSummary,
  SuiteSummary,
  TFieldName,
  Tests,
  TestsContainer,
} from 'SuiteResultTypes';
import { TestWalker } from 'TestWalker';
import {
  useShouldAddValidProperty,
  useShouldAddValidPropertyInGroup,
} from 'shouldAddValidProperty';

export function useProduceSuiteSummary<
  F extends TFieldName
>(): SuiteSummary<F> {
  const summary: SuiteSummary<F> = assign(baseStats(), {
    groups: {},
    tests: {},
    valid: false,
  }) as SuiteSummary<F>;

  TestWalker.walkTests(testObject => {
    useAppendToTest(summary.tests, testObject);
    useAppendToGroup(summary.groups, testObject);
  });

  summary.valid = useShouldAddValidProperty();

  return countFailures(summary);
}

function useAppendToTest(tests: Tests<TFieldName>, testObject: IsolateTest) {
  tests[testObject.fieldName] = appendTestObject(tests, testObject);
  // If `valid` is false to begin with, keep it that way. Otherwise, assess.
  tests[testObject.fieldName].valid =
    tests[testObject.fieldName].valid === false
      ? false
      : useShouldAddValidProperty(testObject.fieldName);
}

/**
 * Appends to a group object if within a group
 */
function useAppendToGroup(groups: Groups, testObject: IsolateTest) {
  const { groupName } = testObject;

  if (!groupName) {
    return;
  }

  groups[groupName] = groups[groupName] || {};
  groups[groupName][testObject.fieldName] = appendTestObject(
    groups[groupName],
    testObject
  );

  groups[groupName][testObject.fieldName].valid =
    groups[groupName][testObject.fieldName].valid === false
      ? false
      : useShouldAddValidPropertyInGroup(groupName, testObject.fieldName);
}

/**
 * Counts the failed tests and adds global counters
 */
function countFailures(
  summary: SuiteSummary<TFieldName>
): SuiteSummary<TFieldName> {
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
  summaryKey: Tests<TFieldName> | Group,
  testObject: IsolateTest
): SingleTestSummary;
function appendTestObject(
  summaryKey: Group | Tests<TFieldName>,
  testObject: IsolateTest
): TestsContainer<TFieldName>[keyof TestsContainer<TFieldName>] {
  const { fieldName, message } = testObject;

  summaryKey[fieldName] = summaryKey[fieldName] || baseTestStats();

  const testKey = summaryKey[fieldName];

  if (testObject.isNonActionable()) return testKey;

  summaryKey[fieldName].testCount++;

  if (testObject.isFailing()) {
    incrementFailures(Severity.ERRORS);
  } else if (testObject.isWarning()) {
    incrementFailures(Severity.WARNINGS);
  }

  return testKey;

  function incrementFailures(severity: Severity) {
    const countKey = countKeyBySeverity(severity);
    testKey[countKey]++;
    if (message) {
      testKey[severity] = (testKey[severity] || []).concat(message);
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
  });
}
