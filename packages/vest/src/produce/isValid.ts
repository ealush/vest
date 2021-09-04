import { isNotEmpty, isEmpty } from 'isEmpty';

import nonMatchingFieldName from 'nonMatchingFieldName';
import type { TDraftResult } from 'produceDraft';
import { useTestObjects, isOptionalField, useAllIncomplete } from 'stateHooks';

export function isValid(result: TDraftResult, fieldName?: string): boolean {
  if (result.hasErrors(fieldName)) {
    return false;
  }

  const [testObjects] = useTestObjects();

  if (isEmpty(testObjects)) {
    return false;
  }

  if (
    isNotEmpty(
      useAllIncomplete().filter(testObject => {
        if (nonMatchingFieldName(testObject, fieldName)) {
          return false;
        }
        return !isOptionalField(testObject.fieldName);
      })
    )
  ) {
    return false;
  }

  return hasMissingTests(fieldName);
}

function hasMissingTests(fieldName?: string): boolean {
  const [testObjects] = useTestObjects();

  return testObjects.every(testObject => {
    if (nonMatchingFieldName(testObject, fieldName)) {
      return true;
    }

    if (isOptionalField(testObject.fieldName)) {
      return true;
    }

    return !testObject.skipped;
  });
}
