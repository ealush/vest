import { isEmpty } from 'isEmpty';
import isFunction from 'isFunction';

import VestTest from 'VestTest';
import { useTestObjects, isOptionalField, useOptionalFields } from 'stateHooks';

export default function omitOptionalTests(): void {
  const [testObjects] = useTestObjects();
  const [optionalFields] = useOptionalFields();

  if (isEmpty(optionalFields)) {
    return;
  }

  const shouldOmit: Record<string, boolean> = {};

  testObjects.forEach(testObject => {
    const fieldName = testObject.fieldName;

    if (shouldOmit.hasOwnProperty(fieldName)) {
      omit(testObject);
    }

    if (isOptionalField(fieldName)) {
      const predicate = optionalFields[fieldName].predicate;
      if (isFunction(predicate)) {
        shouldOmit[fieldName] = predicate();

        omit(testObject);
      }
    }
  });

  function omit(testObject: VestTest) {
    if (shouldOmit[testObject.fieldName]) {
      testObject.omit();
    }
  }
}
