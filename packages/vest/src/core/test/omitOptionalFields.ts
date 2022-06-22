import { isEmpty, hasOwnProperty, isFunction, nestedArray } from 'vest-utils';

import VestTest from 'VestTest';
import {
  useOptionalFields,
  useSetTests,
  useOptionalFieldConfig,
  useSetOptionalField,
} from 'stateHooks';

export default function omitOptionalFields(): void {
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
      useSetOptionalField(testObject.fieldName, current => [current[0], true]);
    }
  }

  function runOptionalConfig(testObject: VestTest) {
    const optionalConfig = useOptionalFieldConfig(testObject.fieldName);
    if (isFunction(optionalConfig)) {
      shouldOmit[testObject.fieldName] = optionalConfig();

      verifyAndOmit(testObject);
    }
  }
}
