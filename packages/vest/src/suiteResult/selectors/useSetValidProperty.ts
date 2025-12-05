import { TIsolate, VestRuntime, Walker } from 'vestjs-runtime';

import {
  SuiteOptionalFields,
  TIsolateSuite,
} from '../../core/isolate/IsolateSuite/IsolateSuite';
import { TIsolateTest } from '../../core/isolate/IsolateTest/IsolateTest';
import { VestTest } from '../../core/isolate/IsolateTest/VestTest';
import { isVestIsolate } from '../../core/isolate/VestIsolateType';
import { nonMatchingFieldName } from '../../core/test/helpers/matchingFieldName';
import { OptionalFieldTypes } from '../../hooks/optional/OptionalTypes';
import { useIsOptionalFieldApplied } from '../../hooks/optional/optional';
import { TFieldName, TGroupName } from '../SuiteResultTypes';

import { hasErrorsByTestObjects } from './hasFailuresByTestObjects';
import { useMapFirstPending } from '../../core/selectors/useIsPending';

/**
 * Determines if a field (or field within a group) should be marked as "valid".
 *
 * This module answers the question: "Is this field ready to be submitted?"
 *
 * ## What makes a field valid?
 *
 * A field is valid when ALL of these conditions are met:
 * 1. The field has no errors (failures)
 * 2. All tests for the field have completed (not pending)
 * 3. All tests for the field have run (not skipped or missing)
 *
 * ## Special cases:
 *
 * - **Optional fields**: If a field is marked as optional AND the optional condition
 *   is met, it's automatically valid regardless of test results. The optional condition
 *   can be:
 *   - AUTO: Tests never ran, OR the field value is blank (empty string, null, undefined)
 *   - CUSTOM: A boolean or function provided to `optional()` evaluates to true
 *
 * - **Empty groups**: If checking a group that has no tests for a field, it's
 *   considered valid (you can't fail tests that don't exist).
 *
 * - **Empty fields**: If checking a field at the top level that has no tests,
 *   it's considered INVALID (incomplete validation).
 *
 * ## Usage:
 *
 * ```typescript
 * // Check if a field is valid at the suite level
 * const isEmailValid = useSetValidProperty('email');
 *
 * // Check if a field is valid within a specific group
 * const isEmailValidInGroup = useSetValidPropertyImpl('email', 'contactInfo');
 * ```
 */

/**
 * Checks if a field is valid at the top level (across all tests in the suite).
 *
 * @param fieldName - The name of the field to check. If undefined, checks entire suite.
 * @returns `true` if the field is valid, `false` otherwise.
 *
 * @example
 * ```typescript
 * // Check if the 'username' field is valid
 * const isValid = useSetValidProperty('username');
 * // Returns true only if:
 * // - All 'username' tests passed (no errors)
 * // - All 'username' tests completed (not pending)
 * // - All 'username' tests ran (not skipped)
 * ```
 */
export function useSetValidProperty(fieldName?: TFieldName): boolean {
  return useSetValidPropertyImpl(fieldName);
}

/**
 * Shared implementation for validity checking with optional group scoping.
 *
 * This is the core logic that determines validity. It can check:
 * - A field across the entire suite (when groupName is undefined)
 * - A field within a specific group (when groupName is provided)
 *
 * @param fieldName - The field to check. If undefined, checks all fields.
 * @param groupName - Optional group name to scope the check to tests within that group only.
 * @returns `true` if valid, `false` otherwise.
 *
 * @example
 * ```typescript
 * // Check if 'email' is valid across entire suite
 * useSetValidPropertyImpl('email'); // groupName = undefined
 *
 * // Check if 'email' is valid within 'shippingAddress' group
 * useSetValidPropertyImpl('email', 'shippingAddress');
 * ```
 *
 * ## How it works (step by step):
 *
 * 1. **Check if optional**: If the field is optional and the optional condition
 *    is applied, immediately return `true`. Optional fields are valid when:
 *    - AUTO type: Tests never ran OR field value is blank ('', null, undefined)
 *    - CUSTOM type: The boolean/function provided to `optional()` returns true
 *
 * 2. **Check for errors**: If any test for this field has errors, return `false`.
 *    A field with errors cannot be valid.
 *
 * 3. **Check for pending tests**: If any non-optional test for this field is
 *    still running (pending), return `false`. We can't say a field is valid
 *    until all its tests complete.
 *
 * 4. **Check for missing tests**: If any test for this field was skipped or
 *    didn't run, return `false`. We need all tests to run to confirm validity.
 *
 * 5. **All checks passed**: Return `true`. The field is valid!
 */
export function useSetValidPropertyImpl(
  fieldName?: TFieldName,
  groupName?: TGroupName,
): boolean {
  // Step 1: Is the field optional, and the optional condition is applied?
  if (useIsOptionalFieldApplied(fieldName).unwrap()) {
    return true;
  }

  // Step 2: Does the field have any tests with errors?
  if (useHasErrors(fieldName, groupName)) {
    return false;
  }

  // Step 3: Does the given field have any pending tests that are not optional?
  if (useHasNonOptionalIncomplete(fieldName, groupName)) {
    return false;
  }

  // Step 4: Did all required tests for the field run?
  const noMissing = useNoMissingTests(fieldName, groupName);
  return noMissing;
}

/**
 * Helper function to check if a field has errors.
 *
 * Decides whether to check errors globally or within a specific group.
 *
 * @param fieldName - The field to check for errors
 * @param groupName - Optional group to scope the check
 * @returns `true` if the field has errors, `false` otherwise
 *
 * @example
 * ```typescript
 * // Check if 'email' has errors anywhere in the suite
 * useHasErrors('email'); // Checks all tests for 'email'
 *
 * // Check if 'email' has errors only in 'billingInfo' group
 * useHasErrors('email', 'billingInfo'); // Only checks 'email' tests in that group
 * ```
 */
function useHasErrors(
  fieldName: TFieldName | undefined,
  groupName?: TGroupName,
): boolean {
  if (groupName) {
    return hasErrorsByTestObjectsInGroup(fieldName, groupName);
  }
  return hasErrorsByTestObjects(fieldName);
}

/**
 * Checks if a specific field has errors within a specific group.
 *
 * This function looks through all test objects and finds ones that:
 * - Belong to the specified group
 * - Test the specified field
 * - Have failed (have errors)
 *
 * @param fieldName - The field to check
 * @param groupName - The group to check within
 * @returns `true` if any test for this field in this group has failed
 *
 * @example
 * ```typescript
 * // Imagine you have:
 * group('contactInfo', () => {
 *   test('email', 'Invalid email', () => false); // This test fails
 *   test('phone', () => true);
 * });
 *
 * hasErrorsByTestObjectsInGroup('email', 'contactInfo'); // true (test failed)
 * hasErrorsByTestObjectsInGroup('phone', 'contactInfo'); // false (test passed)
 * hasErrorsByTestObjectsInGroup('email', 'otherGroup');  // false (not in that group)
 * ```
 */
function hasErrorsByTestObjectsInGroup(
  fieldName: TFieldName | undefined,
  groupName: TGroupName,
): boolean {
  const root = VestRuntime.useAvailableRoot();

  if (!isVestIsolate(root)) {
    return false;
  }

  const tests = root.data.tests;

  return tests.some(testObject => {
    // Skip tests that aren't in our target group
    if (VestTest.getGroupName(testObject) !== groupName) {
      return false;
    }

    // Skip tests that didn't fail
    if (!VestTest.hasFailures(testObject).unwrap()) {
      return false;
    }

    // Skip tests that aren't for our target field
    if (
      nonMatchingFieldName(VestTest.getData(testObject), fieldName).unwrap()
    ) {
      return false;
    }

    // This test is in our group, for our field, and it failed!
    return VestTest.isFailing(testObject).unwrap();
  });
}

/**
 * Checks if a field has any pending (incomplete) tests that are not optional.
 *
 * A test is "pending" when it started running but hasn't finished yet.
 * This commonly happens with async tests.
 *
 * @param fieldName - The field to check
 * @param groupName - Optional group to scope the check
 * @returns `true` if there are pending non-optional tests
 *
 * @example
 * ```typescript
 * // Imagine you have:
 * test('email', async () => {
 *   await checkEmailWithServer(email); // This takes 2 seconds
 *   return result;
 * });
 *
 * // Right after calling suite.run():
 * useHasNonOptionalIncomplete('email'); // true (test still running)
 *
 * // After 2 seconds:
 * useHasNonOptionalIncomplete('email'); // false (test completed)
 * ```
 *
 * ## Why ignore optional fields?
 *
 * If a field is optional and the condition is applied, we don't care if its
 * tests are pending. Optional fields are valid by definition when:
 * - The field is blank (AUTO type)
 * - The custom condition returns true (CUSTOM type)
 * - The tests never ran (AUTO type)
 */
function useHasNonOptionalIncomplete(
  fieldName?: TFieldName,
  groupName?: TGroupName,
) {
  return (
    useMapFirstPending(
      (isolate: TIsolate, breakout: (value: boolean) => void) => {
        const testObject = isolate as TIsolateTest;
        if (useIsPendingTestRelevant(testObject, fieldName, groupName)) {
          breakout(true);
        }
      },
    ) ?? false
  );
}

/**
 * Determines if a pending test is relevant to the current validity check.
 *
 * A pending test is relevant if:
 * 1. It belongs to the target group (if a group is specified)
 * 2. It belongs to the target field (if a field is specified)
 * 3. The field is NOT optional (optional fields are valid even if pending)
 *
 * @param testObject - The pending test to check
 * @param fieldName - The field being validated
 * @param groupName - The group being validated
 * @returns `true` if the pending test prevents the field from being valid
 */
function useIsPendingTestRelevant(
  testObject: TIsolateTest,
  fieldName?: TFieldName,
  groupName?: TGroupName,
): boolean {
  if (groupName && VestTest.getGroupName(testObject) !== groupName) {
    return false;
  }

  if (nonMatchingFieldName(VestTest.getData(testObject), fieldName).unwrap()) {
    return false;
  }

  if (useIsOptionalFieldApplied(fieldName).unwrap()) {
    return false;
  }

  return true;
}

/**
 * Checks if all required tests for a field have run.
 *
 * A test is "missing" if it was defined but:
 * - Skipped (using skip() or skipWhen())
 * - Never executed (mode filters prevented it)
 * - Still pending (hasn't finished yet)
 *
 * @param fieldName - The field to check
 * @param groupName - Optional group to scope the check
 * @returns `true` if all tests ran, `false` if any are missing
 *
 * @example
 * ```typescript
 * // Imagine you have:
 * test('username', () => true);  // Runs
 * skipWhen(someCondition, () => {
 *   test('username', () => true);  // Skipped
 * });
 *
 * // If someCondition is true:
 * useNoMissingTests('username'); // false (one test was skipped)
 *
 * // If someCondition is false:
 * useNoMissingTests('username'); // true (all tests ran)
 * ```
 *
 * ## Empty field handling:
 *
 * What if no tests exist for a field?
 * - **In a group**: Returns `true` (empty group is valid - can't fail tests that don't exist)
 * - **At top level**: Returns `false` (no tests means incomplete validation)
 *
 * This distinction is important:
 * - `group('emptyGroup', () => {})` - valid (intentionally empty)
 * - `create(() => {})` - invalid (you forgot to add tests)
 */
function useNoMissingTests(
  fieldName?: TFieldName,
  groupName?: TGroupName,
): boolean {
  let hasAnyTestsForField = false;
  const root = VestRuntime.useAvailableRoot();

  const result = Walker.every(
    root,
    isolate => {
      const testObject = isolate as TIsolateTest;

      // If checking a group, skip tests not in that group
      if (groupName && VestTest.getGroupName(testObject) !== groupName) {
        return true;
      }

      // Skip tests not for our target field
      if (
        nonMatchingFieldName(VestTest.getData(testObject), fieldName).unwrap()
      ) {
        return true;
      }

      // Found a test for our field!
      hasAnyTestsForField = true;

      return useNoMissingTestsLogic(testObject, fieldName);
    },
    VestTest.is,
  );

  // No tests exist for this field - handle based on context
  if (!hasAnyTestsForField) {
    // Groups: empty is valid (vacuously true - you can't fail tests that don't exist)
    // Top-level: empty is invalid (you probably forgot to add tests)
    return !!groupName;
  }

  return result;
}

/**
 * Checks if a single test should be considered "not missing".
 *
 * A test is "not missing" if it:
 * 1. Already ran and completed (tested)
 * 2. Was intentionally omitted (e.g., optional field is blank: '', null, or undefined)
 * 3. Is an AUTO optional async test that's still running but hasn't finished
 *
 * @param testObject - The test to check
 * @param fieldName - The field being validated
 * @returns `true` if the test is not missing, `false` if it's missing
 *
 * @example
 * ```typescript
 * // Test ran and completed
 * test('email', () => true);
 * useNoMissingTestsLogic(testObject); // true
 *
 * // Test was skipped
 * skip('email');
 * test('email', () => true);
 * useNoMissingTestsLogic(testObject); // false
 *
 * // Test was omitted (optional field is blank)
 * optional('email');
 * test('email', () => false);
 * useNoMissingTestsLogic(testObject); // true (intentionally omitted)
 * ```
 */
function useNoMissingTestsLogic(
  testObject: TIsolateTest,
  fieldName?: TFieldName,
): boolean {
  if (nonMatchingFieldName(VestTest.getData(testObject), fieldName).unwrap()) {
    return true;
  }

  /**
   * Why check for optional fields here?
   *
   * Optional fields have a special rule: if they're marked as AUTO optional
   * (e.g., "optional when blank") and the test hasn't finished yet, we still
   * consider it "not missing".
   *
   * This is different from the omitOptionalFields check, which uses a boolean
   * condition. Here, we only care about whether the test has been tested already.
   *
   * A test is "not missing" if:
   * 1. It already ran (isTested) - we have results
   * 2. It was intentionally omitted (isOmitted) - we don't need results
   * 3. It's an optional AUTO field that's still running - we'll accept its absence
   */

  const isOmitted = VestTest.isOmitted(testObject).unwrap();
  const isTested = VestTest.isTested(testObject).unwrap();
  const awaitsResolution = useOptionalTestAwaitsResolution(testObject);

  return isOmitted || isTested || awaitsResolution;
}

/**
 * Checks if a test belongs to an AUTO optional field that's still running.
 *
 * AUTO optional fields are fields marked as optional without a custom condition:
 * ```typescript
 * optional('email'); // AUTO type
 * optional(['email', 'phone']); // Multiple AUTO fields
 * ```
 *
 * AUTO optional behavior (per documentation):
 * - If tests never ran (e.g., skipped via only()), field is optional
 * - If field value is blank ('', null, undefined) in data object, field is optional
 *
 * When a field is AUTO optional and blank, its tests are typically omitted.
 * But if the test is async and started before we knew the field would be blank,
 * we give it a pass - we don't consider it "missing" even if it hasn't finished.
 *
 * @param testObject - The test to check
 * @returns `true` if this is an AUTO optional field with a pending test
 *
 * @example
 * ```typescript
 * optional('email'); // AUTO optional
 *
 * test('email', async () => {
 *   // User clears the email field while this is running
 *   await validateEmail(email);
 *   return result;
 * });
 *
 * // While test is still running:
 * useOptionalTestAwaitsResolution(testObject); // true
 * // We don't consider this test "missing" even though it's not done
 * ```
 */
function useOptionalTestAwaitsResolution(testObject: TIsolateTest): boolean {
  const root = VestRuntime.useAvailableRoot<TIsolateSuite>();

  const { fieldName } = VestTest.getData(testObject);

  return (
    SuiteOptionalFields.getOptionalField(root, fieldName).type ===
      OptionalFieldTypes.AUTO && VestTest.awaitsResolution(testObject).unwrap()
  );
}
