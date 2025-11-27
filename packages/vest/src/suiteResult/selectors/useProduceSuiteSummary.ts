import { defaultTo, isEmpty, Maybe, assign } from 'vest-utils';
import { VestRuntime } from 'vestjs-runtime';

import { TIsolateSuite } from '../../core/isolate/IsolateSuite/IsolateSuite';
import { TIsolateTest } from '../../core/isolate/IsolateTest/IsolateTest';
import { VestTest } from '../../core/isolate/IsolateTest/VestTest';
import { isVestIsolate } from '../../core/isolate/VestIsolateType';
import { countKeyBySeverity, Severity } from '../Severity';
import {
  CommonSummaryProperties,
  Groups,
  SingleTestSummary,
  SuiteSummary,
  SummaryBase,
  Tests,
  TFieldName,
  TGroupName,
} from '../SuiteResultTypes';
import { SummaryFailure } from '../SummaryFailure';

import {
  useSetValidProperty,
  useSetValidPropertyImpl,
} from './useSetValidProperty';

export function useProduceSuiteSummary<
  F extends TFieldName,
  G extends TGroupName,
>(): SuiteSummary<F, G> {
  const root = VestRuntime.useAvailableRoot<TIsolateSuite>();

  const summary = new SuiteSummary<F, G>();

  if (isVestIsolate(root)) {
    useProcessTests(root.data.tests, summary);
  }

  if (summary.valid !== false) {
    summary.valid = useSetValidProperty();
  }

  return summary;
}

function useProcessTests<F extends TFieldName, G extends TGroupName>(
  tests: TIsolateTest<F>[],
  summary: SuiteSummary<F, G>,
): SuiteSummary<F, G> {
  if (isEmpty(tests)) {
    // early bail for empty test arrays
    summary.valid = false;
    return summary;
  }

  tests.reduce((summary, testObject) => {
    const { fieldName } = VestTest.getData(testObject);

    summary.tests[fieldName] = appendToTest(summary.tests, testObject);
    summary.groups = useAppendToGroup(summary.groups, testObject);

    if (summary.tests[fieldName].valid !== false) {
      summary.tests[fieldName].valid = useSetValidProperty(fieldName);
    }

    if (VestTest.isOmitted(testObject)) {
      return summary;
    }

    if (summary.tests[fieldName].valid === false) {
      summary.valid = false;
    }

    return addSummaryStats(testObject, summary);
  }, summary);

  return summary;
}

function useAppendToGroup<F extends TFieldName, G extends TGroupName>(
  groups: Groups<G, F>,
  testObject: TIsolateTest<F>,
): Groups<G, F> {
  const { fieldName } = VestTest.getData<F>(testObject);
  const groupName = VestTest.getGroupName<G>(testObject);

  if (!groupName) {
    return groups;
  }

  groups[groupName] =
    groups[groupName] || ({} as Groups<G, F>[typeof groupName]);
  const group = groups[groupName];

  const nextGroupEntry = appendTestSummaryObject<SingleTestSummary>(
    group[fieldName],
    testObject,
  );
  (group as Record<string, SingleTestSummary>)[fieldName] = nextGroupEntry;

  // Always re-evaluate validity to account for optional fields
  nextGroupEntry.valid = useSetValidPropertyImpl(fieldName, groupName);

  return groups;
}

function appendToTest<F extends TFieldName>(
  tests: Tests<F>,
  testObject: TIsolateTest<F>,
): SingleTestSummary {
  const fieldName = VestTest.getData<F>(testObject).fieldName;

  const test = appendTestSummaryObject<SingleTestSummary>(
    tests[fieldName],
    testObject,
  );
  return test;
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
