import { isNotEmpty, isEmpty } from 'isEmpty';

import type { TDraftResult } from 'produceDraft';
import { useTestObjects, isOptionalField, useAllIncomplete } from 'stateHooks';

export function isValid(result: TDraftResult): boolean {
  if (result.hasErrors()) {
    return false;
  }

  const [testObjects] = useTestObjects();

  if (isEmpty(testObjects)) {
    return false;
  }

  if (
    isNotEmpty(
      useAllIncomplete().filter(
        testObject => !isOptionalField(testObject.fieldName)
      )
    )
  ) {
    return false;
  }

  return hasMissingTests();
}

function hasMissingTests(): boolean {
  const [testObjects] = useTestObjects();

  return testObjects.every(testObject => {
    if (isOptionalField(testObject.fieldName)) {
      return true;
    }

    return !testObject.skipped;
  });
}
