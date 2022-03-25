import hasOwnProperty from 'hasOwnProperty';
import { isEmpty } from 'isEmpty';
import isFunction from 'isFunction';
import * as nestedArray from 'nestedArray';

import VestTest from 'VestTest';
import { useOptionalFields, useSetTests } from 'stateHooks';

export default function omitOptionalTests(): void {
  const [optionalFields] = useOptionalFields();

  if (isEmpty(optionalFields)) {
    return;
  }

  const shouldOmit: Record<string, boolean> = {};

  useSetTests(tests =>
    nestedArray.transform(tests, (testObject: VestTest) => {
      const fieldName = testObject.fieldName;

      if (hasOwnProperty(shouldOmit, fieldName)) {
        verifyAndOmit(testObject);
      } else {
        runOptionalConfig(testObject);
      }

      return testObject;
    })
  );

  function verifyAndOmit(testObject: VestTest) {
    if (shouldOmit[testObject.fieldName]) {
      testObject.omit();
    }
  }

  function runOptionalConfig(testObject: VestTest) {
    const optionalConfig = optionalFields[testObject.fieldName];
    if (isFunction(optionalConfig)) {
      shouldOmit[testObject.fieldName] = optionalConfig();

      verifyAndOmit(testObject);
    }
  }
}
