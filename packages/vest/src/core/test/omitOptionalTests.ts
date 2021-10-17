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

      if (shouldOmit.hasOwnProperty(fieldName)) {
        omit(testObject);
      } else {
        const optionalConfig = optionalFields[fieldName];
        if (isFunction(optionalConfig)) {
          shouldOmit[fieldName] = optionalConfig();

          omit(testObject);
        }
      }

      return testObject;
    })
  );

  function omit(testObject: VestTest) {
    if (shouldOmit[testObject.fieldName]) {
      testObject.omit();
    }
  }
}
