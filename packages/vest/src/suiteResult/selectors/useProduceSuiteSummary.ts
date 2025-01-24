import { Maybe, assign, defaultTo } from 'vest-utils';

import { TIsolateTest } from 'IsolateTest';
import { countKeyBySeverity, Severity } from 'Severity';
import {
  CommonSummaryProperties,
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
import { useSetValidProperty } from 'useSetValidProperty';

export function useProduceSuiteSummary<
  F extends TFieldName,
  G extends TGroupName,
>(): SuiteSummary<F, G> {
  // @vx-allow use-use (TODO: fix this. the error is in the lint rule)
  const summary = TestWalker.reduceTests<SuiteSummary<F, G>, TIsolateTest<F>>(
    (summary, testObject) => {
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
    },
    new SuiteSummary(),
  );

  if (summary.valid !== false) {
    summary.valid = useSetValidProperty();
  }

  return summary;
}

function addSummaryStats<F extends TFieldName, G extends TGroupName>(
  testObject: TIsolateTest<F>,
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

  if (shouldCountTestRun(testObject)) {
    summary.testCount++;
  }

  return summary;
}

function useAppendToTest<F extends TFieldName>(
  tests: Tests<F>,
  testObject: TIsolateTest<F>,
): SingleTestSummary {
  const fieldName = VestTest.getData<F>(testObject).fieldName;

  const test = appendTestSummaryObject<SingleTestSummary>(
    tests[fieldName],
    testObject,
  );

  // If `valid` is false to begin with, keep it that way. Otherwise, assess.
  if (test.valid !== false) {
    test.valid = useSetValidProperty(fieldName);
  }

  return test;
}

function useAppendToGroup(
  groups: Groups<TGroupName, TFieldName>,
  testObject: TIsolateTest,
): Groups<TGroupName, TFieldName> {
  const { fieldName } = VestTest.getData(testObject);
  const groupName = VestTest.getGroupName(testObject);

  if (!groupName) {
    return groups;
  }

  groups[groupName] = groups[groupName] || {};
  const group = groups[groupName];

  group[fieldName] = appendTestSummaryObject<CommonSummaryProperties>(
    group[fieldName],
    testObject,
  );

  return groups;
}

/**
 * Appends the test to a results object.
 */
// eslint-disable-next-line max-statements, complexity
function appendTestSummaryObject<S extends CommonSummaryProperties>(
  summaryKey: Maybe<S>,
  testObject: TIsolateTest,
): S {
  const { message } = VestTest.getData(testObject);

  // Let's first create a new object, so we don't mutate the original.
  const nextSummaryKey = defaultTo<S>(
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
  if (shouldCountTestRun(testObject)) {
    nextSummaryKey.testCount++;
  }

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

function baseTestStats<S extends CommonSummaryProperties>(): S {
  return assign(new SummaryBase(), {
    errors: [],
    warnings: [],
  }) as unknown as S;
}

function shouldCountTestRun<F extends TFieldName>(
  testObject: TIsolateTest<F>,
): boolean {
  return VestTest.isTested(testObject) || VestTest.isPending(testObject);
}
