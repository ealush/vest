import { isNotEmpty, isEmpty } from 'vest-utils';

import { Severity } from 'Severity';
import VestTest from 'VestTest';
import {
  hasErrorsByTestObjects,
  hasGroupFailuresByTestObjects,
} from 'hasFailuresByTestObjects';
import { nonMatchingFieldName } from 'matchingFieldName';
import { nonMatchingGroupName } from 'matchingGroupName';
import {
  useTestsFlat,
  useAllIncomplete,
  useOptionalFieldConfig,
  useOptionalFieldApplied,
} from 'stateHooks';

// eslint-disable-next-line max-statements, complexity
export function shouldAddValidProperty(fieldName?: string): boolean {
  if (fieldIsOmitted(fieldName)) {
    return true;
  }

  if (hasErrorsByTestObjects(fieldName)) {
    return false;
  }

  const testObjects = useTestsFlat();

  if (isEmpty(testObjects)) {
    return false;
  }

  // Does the given field have any pending tests that are not optional?
  if (hasNonOptionalIncomplete(fieldName)) {
    return false;
  }

  return noMissingTests(fieldName);
}

export function shouldAddValidPropertyInGroup(
  groupName: string,
  fieldName?: string
): boolean {
  if (fieldIsOmitted(fieldName)) {
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

function fieldIsOmitted(fieldName?: string) {
  if (!fieldName) {
    return false;
  }

  return useOptionalFieldApplied(fieldName) === true;
}

// Does the given field have any pending tests that are not optional?
function hasNonOptionalIncomplete(fieldName?: string) {
  return isNotEmpty(
    useAllIncomplete().filter(testObject =>
      isOptionalFieldIncomplete(testObject, fieldName)
    )
  );
}

// Do the given group/field have any pending tests that are not optional?
function hasNonOptionalIncompleteByGroup(
  groupName: string,
  fieldName?: string
) {
  return isNotEmpty(
    useAllIncomplete().filter(testObject => {
      if (nonMatchingGroupName(testObject, groupName)) {
        return false;
      }

      return isOptionalFieldIncomplete(testObject, fieldName);
    })
  );
}

function isOptionalFieldIncomplete(
  testObject: VestTest,
  fieldName?: string
): boolean {
  if (nonMatchingFieldName(testObject, fieldName)) {
    return false;
  }
  return useOptionalFieldConfig(testObject.fieldName) !== true;
}

function noMissingTests(fieldName?: string): boolean {
  const testObjects = useTestsFlat();

  return testObjects.every(testObject => {
    if (nonMatchingFieldName(testObject, fieldName)) {
      return true;
    }

    return missingTestsLogic(testObject, fieldName);
  });
}

function noMissingTestsByGroup(groupName: string, fieldName?: string): boolean {
  const testObjects = useTestsFlat();

  return testObjects.every(testObject => {
    if (nonMatchingGroupName(testObject, groupName)) {
      return true;
    }

    return missingTestsLogic(testObject, fieldName);
  });
}

function missingTestsLogic(testObject: VestTest, fieldName?: string): boolean {
  if (nonMatchingFieldName(testObject, fieldName)) {
    return true;
  }

  return (
    useOptionalFieldConfig(testObject.fieldName) === true ||
    testObject.isTested() ||
    testObject.isOmitted()
  );
}
