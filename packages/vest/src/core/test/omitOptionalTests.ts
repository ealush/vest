import { isEmpty } from 'isEmpty';
import isFunction from 'isFunction';

import VestTest from 'VestTest';
import { setCurrentPocket } from 'pocket';
import { useOptionalFields } from 'stateHooks';

export default function omitOptionalTests(): void {
  const [optionalFields] = useOptionalFields();

  if (isEmpty(optionalFields)) {
    return;
  }

  const shouldOmit: Record<string, boolean> = {};

  setCurrentPocket(testObjects => {
    return testObjects.map(testObject => {
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
    });
  });

  function omit(testObject: VestTest) {
    if (shouldOmit[testObject.fieldName]) {
      testObject.omit();
    }
  }
}
