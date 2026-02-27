/**
 * Module: `src/suiteResult/selectors/hasFailuresByTestObjects.ts`.
 *
 * Provides `hasFailuresByTestObjects`-related runtime and type utilities used by `vest`.
 */
import { VestRuntime } from 'vestjs-runtime';

import { TIsolateTest } from '../../core/isolate/IsolateTest/IsolateTest';
import { VestTest } from '../../core/isolate/IsolateTest/VestTest';
import { isVestIsolate } from '../../core/isolate/VestIsolateType';
import { nonMatchingFieldName } from '../../core/test/helpers/matchingFieldName';
import { nonMatchingSeverityProfile } from '../../core/test/helpers/nonMatchingSeverityProfile';
import { useHasFromRegistry } from '../../core/test/TestRegistry';
import { Severity } from '../Severity';
import { TFieldName } from '../SuiteResultTypes';

/**
 * Checks if a specific field (or the entire suite) has error-severity failures.
 *
 * @param fieldName - Optional field name to check.
 * @returns `true` if failures exist.
 */
export function useHasErrorsByTestObjects(fieldName?: TFieldName): boolean {
  return useHasFailuresByTestObjects(Severity.ERRORS, fieldName);
}

/**
 * Shared logic to check for failures of a specific severity.
 *
 * @param severityKey - The severity to check (ERRORS or WARNINGS).
 * @param fieldName - Optional field name to check.
 */
function useHasFailuresByTestObjects(
  severityKey: Severity,
  fieldName?: TFieldName,
): boolean {
  // First, check the reactive status indices for an instant result
  if (useIsFailing(severityKey, fieldName)) {
    return true;
  }

  // Fallback: If not found in indices, check all tests (handles edge cases
  // where indices might not yet be fully populated or during reprocessing).
  return useAllFailuresByTestObjects(severityKey, fieldName);
}

/**
 * Checks if any test has the specified failure status using the TestRegistry.
 */
function useIsFailing(severityKey: Severity, fieldName?: TFieldName): boolean {
  if (severityKey === Severity.ERRORS) {
    return useHasFromRegistry('failed', fieldName);
  }

  if (severityKey === Severity.WARNINGS) {
    return useHasFromRegistry('warning', fieldName);
  }

  return false;
}

/**
 * Iterates through all tests in the root isolate to find failures matching the criteria.
 * This is used as a fallback or for more complex checks that indices don't cover.
 */
function useAllFailuresByTestObjects(
  severityKey: Severity,
  fieldName?: TFieldName,
): boolean {
  const root = VestRuntime.useAvailableRoot();

  if (!isVestIsolate(root)) {
    return false;
  }

  const tests = root.data.tests;

  return tests.some(testObject => {
    return hasFailuresByTestObject(testObject, severityKey, fieldName);
  });
}

/**
 * Determines whether a specific test object matches the failure criteria
 * (field name and severity profile).
 */
export function hasFailuresByTestObject(
  testObject: TIsolateTest,
  severityKey: Severity,
  fieldName?: TFieldName,
): boolean {
  if (!VestTest.hasFailures(testObject).unwrap()) {
    return false;
  }

  if (nonMatchingFieldName(VestTest.getData(testObject), fieldName).unwrap()) {
    return false;
  }

  if (nonMatchingSeverityProfile(severityKey, testObject).unwrap()) {
    return false;
  }

  return true;
}
