import { useIsOptionalFiedApplied } from 'optional';

import { IsolateTest } from 'IsolateTest';
import { OptionalFieldTypes } from 'OptionalTypes';
import { useAvailableSuiteRoot } from 'PersistedContext';
import { Severity } from 'Severity';
import { TFieldName, TGroupName } from 'SuiteResultTypes';
import { TestWalker } from 'TestWalker';
import {
  hasErrorsByTestObjects,
  hasGroupFailuresByTestObjects,
} from 'hasFailuresByTestObjects';
import { nonMatchingFieldName } from 'matchingFieldName';
import { nonMatchingGroupName } from 'matchingGroupName';

export function useShouldAddValidProperty(fieldName?: TFieldName): boolean {
  // Is the field optional, and the optional condition is applied
  if (useIsOptionalFiedApplied(fieldName)) {
    return true;
  }

  // Are there no tests?
  if (TestWalker.hasNoTests()) {
    return false;
  }

  // // Does the field have any tests with errors?
  if (hasErrorsByTestObjects(fieldName)) {
    return false;
  }

  // Does the given field have any pending tests that are not optional?
  if (useHasNonOptionalIncomplete(fieldName)) {
    return false;
  }

  // Does the field have no missing tests?
  return useNoMissingTests(fieldName);
}

export function useShouldAddValidPropertyInGroup(
  groupName: TGroupName,
  fieldName: TFieldName
): boolean {
  if (useIsOptionalFiedApplied(fieldName)) {
    return true;
  }

  if (hasGroupFailuresByTestObjects(Severity.ERRORS, groupName, fieldName)) {
    return false;
  }

  // Do the given group/field have any pending tests that are not optional?
  if (useHasNonOptionalIncompleteByGroup(groupName, fieldName)) {
    return false;
  }

  return useNoMissingTestsByGroup(groupName, fieldName);
}

// Does the given field have any pending tests that are not optional?
function useHasNonOptionalIncomplete(fieldName?: TFieldName) {
  return TestWalker.someIncompleteTests(testObject => {
    if (nonMatchingFieldName(testObject, fieldName)) {
      return false;
    }
    return !useIsTestObjectOptional(testObject, fieldName);
  });
}

// Do the given group/field have any pending tests that are not optional?
function useHasNonOptionalIncompleteByGroup(
  groupName: TGroupName,
  fieldName: TFieldName
): boolean {
  return TestWalker.someIncompleteTests(testObject => {
    if (nonMatchingGroupName(testObject, groupName)) {
      return false;
    }

    if (nonMatchingFieldName(testObject, fieldName)) {
      return false;
    }

    return !useIsTestObjectOptional(testObject, fieldName);
  });
}

function useIsTestObjectOptional(
  testObject: IsolateTest,
  fieldName?: TFieldName
): boolean {
  if (nonMatchingFieldName(testObject, fieldName)) {
    return false;
  }

  return useIsOptionalFiedApplied(fieldName);
}

// Did all of the tests for the provided field run/omit?
// This makes sure that the fields are not skipped or pending.
function useNoMissingTests(fieldName?: string): boolean {
  return TestWalker.everyTest(testObject => {
    return useNoMissingTestsLogic(testObject, fieldName);
  });
}

// Does the group have no missing tests?
function useNoMissingTestsByGroup(
  groupName: TGroupName,
  fieldName?: TFieldName
): boolean {
  return TestWalker.everyTest(testObject => {
    if (nonMatchingGroupName(testObject, groupName)) {
      return true;
    }

    return useNoMissingTestsLogic(testObject, fieldName);
  });
}

function useNoMissingTestsLogic(
  testObject: IsolateTest,
  fieldName?: TFieldName
): boolean {
  if (nonMatchingFieldName(testObject, fieldName)) {
    return true;
  }

  /**
   * The reason we're checking for the optional field here and not in "omitOptionalFields"
   * is because that unlike the bool/function check we do there, here it only depends on
   * whether the field was tested alredy or not.
   *
   * We qualify the test as not missing only if it was already run, if it is omitted,
   * or if it is marked as optional, even if the optional check did not apply yet -
   * but the test did not reach its final state.
   */

  return (
    testObject.isOmitted() ||
    testObject.isTested() ||
    useOptionalTestAwaitsResolution(testObject)
  );
}

function useOptionalTestAwaitsResolution(testObject: IsolateTest): boolean {
  // Does the test belong to an optional field,
  // and the test itself is still in an indeterminate state?

  return (
    useAvailableSuiteRoot()?.getOptionalField(testObject.fieldName).type ===
      OptionalFieldTypes.AUTO && testObject.awaitsResolution()
  );
}
