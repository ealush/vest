import { countKeyBySeverity, Severity } from 'Severity';
import { VestTest } from 'VestTest';
import { assign } from 'vest-utils';

import {
  Group,
  Groups,
  SingleTestSummary,
  SuiteSummary,
  Tests,
  TestsContainer,
} from 'SuiteSymmaryTypes';
import { Isolate, IsolateTypes } from 'isolateTypes';
import { walk } from 'walk';

export function produceSuiteSummary(isolate: Isolate<unknown>): SuiteSummary {
  const summary: SuiteSummary = assign(baseStats(), {
    groups: {},
    tests: {},
    valid: false,
  });

  walk(
    isolate,
    (node: Isolate<unknown>) => {
      const testIsolate = node as Isolate<VestTest>;
      const testObject = testIsolate.data;

      if (!testObject) {
        return;
      }

      appendToTest(summary.tests, testObject);
      appendToGroup(summary.groups, testObject);
    },
    IsolateTypes.TEST
  );

  return countFailures(summary);
}

function appendToTest(tests: Tests, testObject: VestTest) {
  tests[testObject.name] = appendTestObject(tests, testObject);
  // If `valid` is false to begin with, keep it that way. Otherwise, assess.
  tests[testObject.name].valid =
    // eslint-disable-next-line no-unneeded-ternary
    tests[testObject.name].valid === false ? false : true; //TODO: UNCOMMENT shouldAddValidProperty(testObject.name);
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
  groups[groupName][testObject.name] = appendTestObject(
    groups[groupName],
    testObject
  );

  // TODO: ADD THIS PART BACK
  // groups[groupName][testObject.name].valid =
  //   groups[groupName][testObject.name].valid === false
  //     ? false
  //     : shouldAddValidPropertyInGroup(groupName, testObject.name);
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
  const { name, message } = testObject;

  summaryKey[name] = summaryKey[name] || baseTestStats();

  const testKey = summaryKey[name];

  if (testObject.isNonActionable()) return testKey;

  summaryKey[name].testCount++;

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
