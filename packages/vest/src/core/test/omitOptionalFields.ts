import {
  isEmpty,
  hasOwnProperty,
  isFunction,
  optionalFunctionValue,
} from 'vest-utils';

import VestTest from 'VestTest';
import {
  useOptionalFields,
  // useSetTests,
  useOptionalFieldConfig,
  useSetOptionalField,
  useTestsFlat,
  useRefreshTestObjects,
  useSetOptionalFieldNew,
} from 'stateHooks';

/**
 * This module gets triggered once the suite is done running its sync tests.
 *
 * It goes over all the tests in the state, and checks if they need to be omitted.
 */

export default function omitOptionalFields(): void {
  const [optionalFields] = useOptionalFields();

  // If there are no optional fields, we don't need to do anything
  if (isEmpty(optionalFields)) {
    return;
  }

  // Create an object to store the fields that need to be omitted
  const shouldOmit: Record<string, boolean> = {};

  // iterate over each of the tests in the state
  useTestsFlat().forEach(testObject => {
    // If we already added the current field (not this test specifically)
    // no need for further checks, go and omit the test
    if (hasOwnProperty(shouldOmit, testObject.fieldName)) {
      verifyAndOmit(testObject);
    } else {
      // check if the field has an optional function
      // if so, run it and verify/omit the test
      runOptionalConfig(testObject);
    }
  });

  // refresh the tests in the state so that the omitted fields are applied
  useRefreshTestObjects();

  function verifyAndOmit(testObject: VestTest) {
    if (shouldOmit[testObject.fieldName]) {
      testObject.omit();
      useSetOptionalField(testObject.fieldName, current => [current[0], true]);
      useSetOptionalFieldNew(testObject.fieldName, () => ({
        applied: true,
      }));
    }
  }

  function runOptionalConfig(testObject: VestTest) {
    // Ge the optional configuration for the given field
    const optionalConfig = useOptionalFieldConfig(testObject.fieldName);

    // If the optional was set to a function, run it and verify/omit the test
    if (isFunction(optionalConfig)) {
      shouldOmit[testObject.fieldName] = optionalFunctionValue(optionalConfig);

      verifyAndOmit(testObject);
    }
  }
}
