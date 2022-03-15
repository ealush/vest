import assign from 'assign';

import { Severity, SeverityCount } from 'Severity';
import VestTest from 'VestTest';
import { useTestsFlat } from 'stateHooks';

/**
 * Reads the testObjects list and gets full validation result from it.
 */
export default function genTestsSummary(): TTestSummary {
  const testObjects = useTestsFlat();

  const summary: TTestSummary = assign(baseStats(), {
    groups: {},
    tests: {},
  });

  testObjects.reduce(
    (summary: TTestSummary, testObject: VestTest): TTestSummary => {
      appendToTest(summary.tests, testObject);
      appendToGroup(summary.groups, testObject);
      return summary;
    },
    summary
  );

  return countFailures(summary);
}

function appendToTest(tests: TTestGroup, testObject: VestTest) {
  tests[testObject.fieldName] = appendTestObject(tests, testObject);
}

/**
 * Appends to a group object if within a group
 */
function appendToGroup(groups: TGroups, testObject: VestTest) {
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
function countFailures(summary: TTestSummary): TTestSummary {
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
  summaryKey: TTestGroup,
  testObject: VestTest
): TSingleTestSummary {
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

type TGroups = Record<string, TTestGroup>;

type TTestSummary = {
  groups: TGroups;
  tests: TTestGroup;
} & TTestSummaryBase;

type TTestGroup = Record<string, TSingleTestSummary>;

type TSingleTestSummary = {
  errors: string[];
  warnings: string[];
} & TTestSummaryBase;

type TTestSummaryBase = {
  errorCount: number;
  warnCount: number;
  testCount: number;
};
