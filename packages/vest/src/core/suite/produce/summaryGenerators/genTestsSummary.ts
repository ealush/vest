import { assign, invariant } from 'vest-utils';

import { countKeyBySeverity, Severity } from 'Severity';
import VestTest from 'VestTest';
import ctx from 'ctx';
import {
  shouldAddValidProperty,
  shouldAddValidPropertyInGroup,
} from 'shouldAddValidProperty';
import { useTestsFlat } from 'stateHooks';

export function useSummary(): SuiteSummary {
  const { summary } = ctx.useX();
  invariant(summary);

  return summary;
}

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

  summary.valid = shouldAddValidProperty();

  return countFailures(summary);
}

function appendToTest(tests: Tests, testObject: VestTest) {
  tests[testObject.fieldName] = appendTestObject(tests, testObject);
  // If `valid` is false to begin with, keep it that way. Otherwise, assess.
  tests[testObject.fieldName].valid =
    tests[testObject.fieldName].valid === false
      ? false
      : shouldAddValidProperty(testObject.fieldName);
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

  groups[groupName][testObject.fieldName].valid =
    groups[groupName][testObject.fieldName].valid === false
      ? false
      : shouldAddValidPropertyInGroup(groupName, testObject.fieldName);
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
 * Appends the test to a results object.
 * Overload is only needed to satisfy typescript. No use in breaking it down to multiple
 * functions as it is really the same, with the difference of "valid" missing in groups
 */
// eslint-disable-next-line max-statements
function appendTestObject(
  summaryKey: Tests | Group,
  testObject: VestTest
): SingleTestSummary;
function appendTestObject(
  summaryKey: Group | Tests,
  testObject: VestTest
): TestsContainer[keyof TestsContainer] {
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

export type SuiteSummary = {
  groups: Groups;
  tests: Tests;
  valid: boolean;
} & SummaryBase;

export type TestsContainer = Group | Tests;
export type GroupTestSummary = SingleTestSummary;

type Groups = Record<string, Group>;
type Group = Record<string, GroupTestSummary>;
type Tests = Record<string, SingleTestSummary>;

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
