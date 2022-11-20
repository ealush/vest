import { Severity } from 'Severity';
import { VestTest } from 'VestTest';
import {
  hasErrorsByTestObjects,
  hasGroupFailuresByTestObjects,
} from 'hasFailuresByTestObjects';
import { nonMatchingFieldName } from 'matchingFieldName';
import { nonMatchingGroupName } from 'matchingGroupName';
import { isOptionalFiedApplied } from 'optional';

import { OptionalFieldTypes } from 'OptionalTypes';
import { useOptionalField } from 'SuiteContext';
import { TestWalker } from 'SuiteWalker';

export function shouldAddValidProperty(fieldName?: string): boolean {
  // Is the field optional, and the optional condition is applied
  if (isOptionalFiedApplied(fieldName)) {
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
  if (hasNonOptionalIncomplete(fieldName)) {
    return false;
  }

  // Does the field have no missing tests?
  return noMissingTests(fieldName);
}

export function shouldAddValidPropertyInGroup(
  groupName: string,
  fieldName: string
): boolean {
  if (isOptionalFiedApplied(fieldName)) {
    return true;
  }

  if (hasGroupFailuresByTestObjects(Severity.ERRORS, groupName, fieldName)) {
    return false;
  }

  // Do the given group/field have any pending tests that are not optional?
  if (hasNonOptionalIncompleteByGroup(groupName, fieldName)) {
    return false;
  }

  return noMissingTestsByGroup(groupName, fieldName);
}

// Does the given field have any pending tests that are not optional?
function hasNonOptionalIncomplete(fieldName?: string) {
  return TestWalker.someIncompleteTests(testObject => {
    return isTestObjectOptional(testObject, fieldName);
  });
}

// Do the given group/field have any pending tests that are not optional?
function hasNonOptionalIncompleteByGroup(
  groupName: string,
  fieldName: string
): boolean {
  return TestWalker.someIncompleteTests(testObject => {
    if (nonMatchingGroupName(testObject, groupName)) {
      return false;
    }

    return isTestObjectOptional(testObject, fieldName);
  });
}

function isTestObjectOptional(
  testObject: VestTest,
  fieldName?: string
): boolean {
  if (nonMatchingFieldName(testObject, fieldName)) {
    return false;
  }

  return isOptionalFiedApplied(fieldName);
}

// Did all of the tests for the provided field run/omit?
// This makes sure that the fields are not skipped or pending.
function noMissingTests(fieldName?: string): boolean {
  return TestWalker.everyTest(testObject => {
    return noMissingTestsLogic(testObject, fieldName);
  });
}

// Does the group have no missing tests?
function noMissingTestsByGroup(groupName: string, fieldName?: string): boolean {
  return TestWalker.everyTest(testObject => {
    if (nonMatchingGroupName(testObject, groupName)) {
      return true;
    }

    return noMissingTestsLogic(testObject, fieldName);
  });
}

function noMissingTestsLogic(
  testObject: VestTest,
  fieldName?: string
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
    optionalTestAwaitsResolution(testObject) ||
    testObject.isTested() ||
    testObject.isOmitted()
  );
}

function optionalTestAwaitsResolution(testObject: VestTest): boolean {
  // Does the test belong to an optional field,
  // and the test itself is still in an indeterminate state?
  return (
    useOptionalField(testObject.fieldName).type ===
      OptionalFieldTypes.Delayed && testObject.awaitsResolution()
  );
}
