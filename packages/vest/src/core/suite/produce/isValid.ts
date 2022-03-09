import { isNotEmpty, isEmpty } from 'isEmpty';

import { hasErrors } from 'hasFailures';
import { nonMatchingFieldName } from 'matchingFieldName';
import {
  useTestsFlat,
  useAllIncomplete,
  useOptionalFields,
  useOmittedFields,
} from 'stateHooks';

// eslint-disable-next-line max-statements, complexity
export function isValid(fieldName?: string): boolean {
  if (fieldIsOmitted(fieldName)) {
    return true;
  }

  if (hasErrors(fieldName)) {
    return false;
  }

  const testObjects = useTestsFlat();

  if (isEmpty(testObjects)) {
    return false;
  }

  if (fieldDoesNotExist(fieldName)) {
    return false;
  }

  if (hasNonOptionalIncomplete(fieldName)) {
    return false;
  }

  return noMissingTests(fieldName);
}

function fieldIsOmitted(fieldName?: string) {
  const omittedFields = useOmittedFields();

  if (!fieldName) {
    return false;
  }

  return !!omittedFields[fieldName];
}

function hasNonOptionalIncomplete(fieldName?: string) {
  const [optionalFields] = useOptionalFields();

  return isNotEmpty(
    useAllIncomplete().filter(testObject => {
      if (nonMatchingFieldName(testObject, fieldName)) {
        return false;
      }
      return optionalFields[testObject.fieldName] !== true;
    })
  );
}

function fieldDoesNotExist(fieldName?: string): boolean {
  const testObjects = useTestsFlat();
  return (
    !!fieldName &&
    !testObjects.find(testObject => testObject.fieldName === fieldName)
  );
}

function noMissingTests(fieldName?: string): boolean {
  const testObjects = useTestsFlat();
  const [optionalFields] = useOptionalFields();

  return testObjects.every(testObject => {
    if (nonMatchingFieldName(testObject, fieldName)) {
      return true;
    }

    return (
      optionalFields[testObject.fieldName] === true ||
      testObject.isTested() ||
      testObject.isOmitted()
    );
  });
}
