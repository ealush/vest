import { defaultTo, isEmpty, Maybe, assign } from 'vest-utils';
import { VestRuntime } from 'vestjs-runtime';

import { TIsolateSuite } from '../../core/isolate/IsolateSuite/IsolateSuite';
import { TIsolateTest } from '../../core/isolate/IsolateTest/IsolateTest';
import { VestTest } from '../../core/isolate/IsolateTest/VestTest';
import { useDependencies } from '../../core/Runtime';
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
  TSchema,
} from '../SuiteResultTypes';
import { SummaryFailure } from '../SummaryFailure';

import {
  useNoMissingTestsLogic,
} from './useSetValidProperty';

export function useProduceSuiteSummary<
  F extends TFieldName,
  G extends TGroupName,
  D = unknown,
  S extends TSchema = undefined,
>(): SuiteSummary<F, G, D, S> {
  const root = VestRuntime.useAvailableRoot<TIsolateSuite>();

  const summary = new SuiteSummary<F, G, D, S>();

  if (isVestIsolate(root)) {
    useProcessTests(root.data.tests, summary);
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

    summary.tests[fieldName] = useAppendToTest(summary.tests, testObject);
    summary.groups = useAppendToGroup(summary.groups, testObject);

    if (VestTest.isOmitted(testObject).unwrap()) {
      return summary;
    }

    return addSummaryStats(testObject, summary);
  }, summary);

  // After we have all the tests bucketed, we decide on the final validity
  // of the suite.
  // We iterate over all the fields we've seen, and if any of them is not valid,
  // the suite is not valid.
  const dependencies = useDependencies();

  for (const fieldName in summary.tests) {
    const isFieldValid = determineFieldValidity(
      fieldName as F,
      summary,
      dependencies,
    );

    summary.tests[fieldName].valid = isFieldValid;

    if (isFieldValid === false) {
      summary.valid = false;
    }
  }

  return summary;
}

function determineFieldValidity<F extends TFieldName, G extends TGroupName>(
  fieldName: F,
  summary: SuiteSummary<F, G>,
  dependencies: Record<string, string[]>,
): boolean {
  const queue: string[] = [fieldName as string];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (visited.has(current)) {
      continue;
    }
    visited.add(current);

    const fieldSummary = summary.tests[current as F];

    // Pillar 3: A field is NOT valid if its own tests failed or were not run
    if (!fieldSummary || fieldSummary.valid === false) {
      return false;
    }

    const fieldDeps = dependencies[current];

    if (fieldDeps) {
      for (const dep of fieldDeps) {
        queue.push(dep);
      }
    }
  }

  return true;
}

function useAppendToGroup<F extends TFieldName, G extends TGroupName>(
  groups: Groups<G, F>,
  testObject: TIsolateTest<F>,
): Groups<G, F> {
  const groupName = VestTest.getGroupName<G>(testObject);

  if (!groupName) {
    return groups;
  }

  const group = ensureGroup<F, G>(groups, groupName);

  const { fieldName } = VestTest.getData<F>(testObject);

  const nextGroupEntry = useAppendTestSummaryObject(
    group[fieldName],
    testObject,
  );
  (group as Record<string, SingleTestSummary>)[fieldName] = nextGroupEntry;

  return groups;
}

function ensureGroup<F extends TFieldName, G extends TGroupName>(
  groups: Groups<G, F>,
  groupName: G,
): Groups<G, F>[G] {
  groups[groupName] =
    groups[groupName] || ({} as Groups<G, F>[typeof groupName]);
  return groups[groupName];
}

function useAppendToTest<F extends TFieldName>(
  tests: Tests<F>,
  testObject: TIsolateTest<F>,
): SingleTestSummary {
  const fieldName = VestTest.getData<F>(testObject).fieldName;

  const test = useAppendTestSummaryObject(tests[fieldName], testObject);
  return test;
}

function addSummaryStats<F extends TFieldName, G extends TGroupName>(
  testObject: TIsolateTest<F>,
  summary: SuiteSummary<F, G>,
): SuiteSummary<F, G> {
  if (VestTest.isWarning(testObject).unwrap()) {
    summary.warnCount++;
    summary.warnings.push(SummaryFailure.fromTestObject(testObject));
  } else if (VestTest.isFailing(testObject).unwrap()) {
    summary.errorCount++;
    summary.errors.push(SummaryFailure.fromTestObject(testObject));
  }

  if (VestTest.isStartedStatus(testObject)) {
    summary.pendingCount++;
  }

  if (shouldCountTestRun(testObject)) {
    summary.testCount++;
  }

  return summary;
}

function useAppendTestSummaryObject(
  summaryKey: Maybe<SingleTestSummary>,
  testObject: TIsolateTest,
): SingleTestSummary {
  const nextSummaryKey = createNewSummaryKey(summaryKey) as SingleTestSummary;

  const isNoMissing = useNoMissingTestsLogic(testObject);

  if (nextSummaryKey.valid !== false) {
    nextSummaryKey.valid = isNoMissing;
  }

  return updateSummaryWithTestResults(nextSummaryKey, testObject);
}

function createNewSummaryKey<S extends CommonSummaryProperties>(
  summaryKey: Maybe<S>,
): S {
  return defaultTo<S>(summaryKey ? { ...summaryKey } : null, baseTestStats);
}

function updateSummaryWithTestResults(
  nextSummaryKey: SingleTestSummary,
  testObject: TIsolateTest,
): SingleTestSummary {
  const isStarted = VestTest.isStartedStatus(testObject);
  const isFailing = VestTest.isFailing(testObject).unwrap();

  if (isStarted) {
    nextSummaryKey.pendingCount++;
  }

  updateFailures(nextSummaryKey, testObject, isFailing);

  if (isStarted || isFailing) {
    nextSummaryKey.valid = false;
  }

  if (shouldCountTestRun(testObject)) {
    nextSummaryKey.testCount++;
  }

  return nextSummaryKey;
}

function updateFailures(
  nextSummaryKey: SingleTestSummary,
  testObject: TIsolateTest,
  isFailing: boolean,
): void {
  const { message } = VestTest.getData(testObject);

  if (isFailing) {
    incrementFailures(nextSummaryKey, Severity.ERRORS, message);
  } else if (VestTest.isWarning(testObject).unwrap()) {
    incrementFailures(nextSummaryKey, Severity.WARNINGS, message);
  }
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
  return (
    VestTest.isTested(testObject).unwrap() ||
    VestTest.isStartedStatus(testObject)
  );
}
