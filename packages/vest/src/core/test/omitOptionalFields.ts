import VestTest from 'VestTest';
import { isEmpty, hasOwnProperty, optionalFunctionValue } from 'vest-utils';

import { OptionalFieldTypes } from 'optionalFields';
import {
  useOptionalFields,
  useTestsFlat,
  useRefreshTestObjects,
  useSetOptionalField,
  useOptionalField,
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
      useSetOptionalField(testObject.fieldName, () => ({
        applied: true,
      }));
    }
  }

  function runOptionalConfig(testObject: VestTest) {
    // Ge the optional configuration for the given field
    const optionalConfig = useOptionalField(testObject.fieldName);

    // If the optional was set to a function or a boolean, run it and verify/omit the test
    if (optionalConfig.type === OptionalFieldTypes.Immediate) {
      shouldOmit[testObject.fieldName] = optionalFunctionValue(
        optionalConfig.rule
      );

      verifyAndOmit(testObject);
    }
  }
}
