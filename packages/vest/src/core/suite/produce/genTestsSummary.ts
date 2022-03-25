import assign from 'assign';

import { Severity, SeverityCount } from 'Severity';
import VestTest from 'VestTest';
import { isValid } from 'isValid';
import { useTestsFlat } from 'stateHooks';

/**
 * Reads the testObjects list and gets full validation result from it.
 */
export default function genTestsSummary(): SuiteSummary {
  const testObjects = useTestsFlat();

  const summary: SuiteSummary = assign(baseStats(), {
    groups: {},
    tests: {},
    valid: false,
  });

  testObjects.reduce(
    (summary: SuiteSummary, testObject: VestTest): SuiteSummary => {
      appendToTest(summary.tests, testObject);
      appendToGroup(summary.groups, testObject);
      return summary;
    },
    summary
  );

  summary.valid = isValid();

  return countFailures(summary);
}

function appendToTest(tests: TestGroup, testObject: VestTest) {
  tests[testObject.fieldName] = appendTestObject(tests, testObject);
  // If `valid` is false to begin with, keep it that way. Otherwise, assess.
  tests[testObject.fieldName].valid =
    tests[testObject.fieldName].valid === false
      ? false
      : isValid(testObject.fieldName);
}

/**
 * Appends to a group object if within a group
 */
function appendToGroup(groups: Groups, testObject: VestTest) {
  const { groupName } = testObject;

  if (!groupName) {
    return;
  }

  groups[groupName] = groups[groupName] || {};
  groups[groupName][testObject.fieldName] = appendTestObject(
    groups[groupName],
    testObject
  );
}

/**
 * Counts the failed tests and adds global counters
 */
function countFailures(summary: SuiteSummary): SuiteSummary {
  for (const test in summary.tests) {
    summary.errorCount += summary.tests[test].errorCount;
    summary.warnCount += summary.tests[test].warnCount;
    summary.testCount += summary.tests[test].testCount;
  }
  return summary;
}

/**
 * Appends the test to a results object
 */
// eslint-disable-next-line max-statements
function appendTestObject(
  summaryKey: TestGroup,
  testObject: VestTest
): SingleTestSummary {
  const { fieldName, message } = testObject;

  summaryKey[fieldName] = summaryKey[fieldName] || baseStats();

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
    const countKey = getCountKey(severity);
    testKey[countKey]++;
    if (message) {
      testKey[severity] = (testKey[severity] || []).concat(message);
    }
  }
}

function getCountKey(severity: Severity): SeverityCount {
  return severity === Severity.ERRORS
    ? SeverityCount.ERROR_COUNT
    : SeverityCount.WARN_COUNT;
}

function baseStats() {
  return {
    errorCount: 0,
    warnCount: 0,
    testCount: 0,
  };
}

type Groups = Record<string, TestGroup>;

export type SuiteSummary = {
  groups: Groups;
  tests: TestGroup;
  valid: boolean;
} & SummaryBase;

export type TestGroup = Record<string, SingleTestSummary>;

type SingleTestSummary = SummaryBase & {
  errors: string[];
  warnings: string[];
  valid: boolean;
};

type SummaryBase = {
  errorCount: number;
  warnCount: number;
  testCount: number;
};
