import VestTest from 'VestTest';
import { useTestsOrdered } from 'stateHooks';
import type { TSeverity } from 'vestTypes';

/**
 * Reads the testObjects list and gets full validation result from it.
 */
export default function genTestsSummary(): TTestSummary {
  const [testObjects] = useTestsOrdered();

  const summary: TTestSummary = {
    errorCount: 0,
    groups: {},
    testCount: 0,
    tests: {},
    warnCount: 0,
  };

  appendSummary(testObjects);

  return countFailures(summary);

  function appendSummary(testObjects: VestTest[]) {
    testObjects.forEach(testObject => {
      const { fieldName, groupName, skipped } = testObject;

      summary.tests[fieldName] = genTestObject(
        summary.tests,
        testObject,
        skipped
      );

      if (groupName) {
        summary.groups[groupName] = summary.groups[groupName] || {};
        summary.groups[groupName][fieldName] = genTestObject(
          summary.groups[groupName],
          testObject,
          skipped
        );
      }
    });
  }
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

function genTestObject(
  summaryKey: TTestGroup,
  testObject: VestTest,
  skipped?: boolean
): TSingleTestSummary {
  const { fieldName, isWarning, failed, message } = testObject;

  summaryKey[fieldName] = summaryKey[fieldName] || {
    errorCount: 0,
    warnCount: 0,
    testCount: 0,
  };

  const testKey = summaryKey[fieldName];

  if (skipped) {
    return testKey;
  }

  summaryKey[fieldName].testCount++;

  // Adds to severity group
  function addTo(countKey: 'warnCount' | 'errorCount', group: TSeverity) {
    testKey[countKey]++;
    if (message) {
      testKey[group] = (testKey[group] || []).concat(message);
    }
  }

  if (failed) {
    if (isWarning) {
      addTo('warnCount', 'warnings');
    } else {
      addTo('errorCount', 'errors');
    }
  }

  return testKey;
}

type TTestSummary = {
  groups: Record<string, TTestGroup>;
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
