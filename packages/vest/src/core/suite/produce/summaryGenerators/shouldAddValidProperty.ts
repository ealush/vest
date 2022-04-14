import { isNotEmpty, isEmpty } from 'isEmpty';

import { hasErrorsByTestObjects } from 'hasFailuresByTestObjects';
import { nonMatchingFieldName } from 'matchingFieldName';
import {
  useTestsFlat,
  useAllIncomplete,
  useOptionalFieldConfig,
  useOptionalFieldApplied,
} from 'stateHooks';

// eslint-disable-next-line max-statements, complexity
export default function shouldAddValidProp(fieldName?: string): boolean {
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

  if (hasNonOptionalIncomplete(fieldName)) {
    return false;
  }

  return noMissingTests(fieldName);
}

function fieldIsOmitted(fieldName?: string) {
  if (!fieldName) {
    return false;
  }

  return useOptionalFieldApplied(fieldName) === true;
}

function hasNonOptionalIncomplete(fieldName?: string) {
  return isNotEmpty(
    useAllIncomplete().filter(testObject => {
      if (nonMatchingFieldName(testObject, fieldName)) {
        return false;
      }
      return useOptionalFieldConfig(testObject.fieldName) !== true;
    })
  );
}

function noMissingTests(fieldName?: string): boolean {
  const testObjects = useTestsFlat();

  return testObjects.every(testObject => {
    if (nonMatchingFieldName(testObject, fieldName)) {
      return true;
    }

    return (
      useOptionalFieldConfig(testObject.fieldName) === true ||
      testObject.isTested() ||
      testObject.isOmitted()
    );
  });
}
