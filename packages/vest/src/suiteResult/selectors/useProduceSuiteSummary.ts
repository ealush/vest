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
function appendTestSummaryObject<S extends CommonSummaryProperties>(
  summaryKey: Maybe<S>,
  testObject: TIsolateTest,
): S {
  const nextSummaryKey = createNewSummaryKey(summaryKey);

  if (VestTest.isNonActionable(testObject)) return nextSummaryKey;

  return updateSummaryWithTestResults(nextSummaryKey, testObject);
}

function createNewSummaryKey<S extends CommonSummaryProperties>(
  summaryKey: Maybe<S>,
): S {
  return defaultTo<S>(summaryKey ? { ...summaryKey } : null, baseTestStats);
}

function updateSummaryWithTestResults<S extends CommonSummaryProperties>(
  nextSummaryKey: S,
  testObject: TIsolateTest,
): S {
  const { message } = VestTest.getData(testObject);

  if (VestTest.isPending(testObject)) {
    nextSummaryKey.pendingCount++;
  }

  if (VestTest.isFailing(testObject)) {
    incrementFailures(nextSummaryKey, Severity.ERRORS, message);
  } else if (VestTest.isWarning(testObject)) {
    incrementFailures(nextSummaryKey, Severity.WARNINGS, message);
  }

  if (shouldCountTestRun(testObject)) {
    nextSummaryKey.testCount++;
  }

  return nextSummaryKey;
}

function incrementFailures<S extends CommonSummaryProperties>(
  summaryKey: S,
  severity: Severity,
  message?: string,
): void {
  const countKey = countKeyBySeverity(severity);
  summaryKey[countKey]++;
  if (message) {
    summaryKey[severity] = (summaryKey[severity] || []).concat(message);
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
