import { makeResult, Result } from 'vest-utils';
import { VestRuntime } from 'vestjs-runtime';

import { useHasOnliedTests } from '../../../hooks/focused/useHasOnliedTests';
import { useIsExcluded } from '../../../hooks/focused/useIsExcluded';
import { useShouldSkipBasedOnMode } from '../../../hooks/optional/mode';
import { useIsOptionalFieldApplied } from '../../../hooks/optional/optional';
import { useIsExcludedIndividually } from '../../../isolates/skipWhen';
import { TFieldName } from '../../../suiteResult/SuiteResultTypes';
import {
  SuiteDependencies,
  TIsolateSuite,
} from '../../isolate/IsolateSuite/IsolateSuite';
import { TIsolateTest } from '../../isolate/IsolateTest/IsolateTest';
import { isVestIsolate } from '../../isolate/VestIsolateType';
import { VestTest } from '../../isolate/IsolateTest/VestTest';

// eslint-disable-next-line complexity, max-statements
export function useVerifyTestRun(
  testObject: TIsolateTest,
  collisionResult: TIsolateTest = testObject,
): TIsolateTest {
  const testData = VestTest.getData(testObject);
  if (VestTest.isStartedStatus(testObject)) {
    // If the test is pending, we don't want to run it again.
    // We just return the test object as is.
    return testObject;
  }

  const dependsOnResolved = useDependsOnFlowControl(
    testObject,
    collisionResult,
  );
  if (dependsOnResolved) {
    return dependsOnResolved;
  }

  if (useShouldSkipBasedOnMode(testData)) {
    return skipTestAndReturn(testObject).unwrap();
  }

  if (useShouldOmit(testData.fieldName).unwrap()) {
    return omitTestAndReturn(testObject).unwrap();
  }

  if (useIsExcluded(testObject)) {
    return useForceSkipIfInSkipWhen(collisionResult).unwrap();
  }

  return testObject;
}

function useDependsOnFlowControl(
  testObject: TIsolateTest,
  collisionResult: TIsolateTest,
): TIsolateTest | null {
  const dependencies = useDependenciesForField(testObject);
  const hasFocusedDependency = dependencies.some(dependencyField =>
    useHasOnliedTests(testObject, dependencyField),
  );

  if (!hasFocusedDependency) {
    return null;
  }

  if (!VestTest.isTested(collisionResult).unwrap()) {
    return skipTestAndReturn(testObject).unwrap();
  }

  VestTest.reset(testObject);
  return testObject;
}

function useDependenciesForField(testObject: TIsolateTest): TFieldName[] {
  const root = VestRuntime.useAvailableRoot<TIsolateSuite>();
  if (!isVestIsolate(root)) {
    return [];
  }

  const fieldName = VestTest.getData(testObject).fieldName;
  return SuiteDependencies.getDependencies(root)[fieldName] ?? [];
}

function useShouldOmit(fieldName: TFieldName): Result<boolean> {
  return makeResult.Ok(useIsOptionalFieldApplied(fieldName).unwrap());
}

function skipTestAndReturn(testNode: TIsolateTest): Result<TIsolateTest> {
  VestTest.skip(testNode);
  return makeResult.Ok(testNode);
}

function omitTestAndReturn(testNode: TIsolateTest): Result<TIsolateTest> {
  VestTest.omit(testNode);
  return makeResult.Ok(testNode);
}

function useForceSkipIfInSkipWhen(
  testNode: TIsolateTest,
): Result<TIsolateTest> {
  // We're forcing skipping the pending test
  // if we're directly within a skipWhen block
  // This mostly means that we're probably giving
  // up on this async test intentionally.
  VestTest.skip(testNode, useIsExcludedIndividually());
  return makeResult.Ok(testNode);
}
