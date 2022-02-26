import { isNotEmpty, isEmpty } from 'isEmpty';

import { nonMatchingFieldName } from 'matchingFieldName';
import type { SuiteResult } from 'produceSuiteResult';
import {
  useTestsFlat,
  useAllIncomplete,
  useOptionalFields,
  useOmittedFields,
} from 'stateHooks';

// eslint-disable-next-line max-statements, complexity
export function isValid(result: SuiteResult, fieldName?: string): boolean {
  if (fieldIsOmitted(fieldName)) {
    return true;
  }

  if (result.hasErrors(fieldName)) {
    return false;
  }

  const testObjects = useTestsFlat();

  if (isEmpty(testObjects)) {
    return false;
  }

  if (fieldDoesNotExist(result, fieldName)) {
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

function fieldDoesNotExist(result: SuiteResult, fieldName?: string): boolean {
  return !!fieldName && isEmpty(result.tests[fieldName]);
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
