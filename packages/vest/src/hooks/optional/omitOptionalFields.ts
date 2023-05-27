import { VestRuntime } from 'vest-runtime';
import {
  isEmpty,
  hasOwnProperty,
  optionalFunctionValue,
  isNullish,
} from 'vest-utils';

import { Events } from 'BusEvents';
import type { IsolateSuite } from 'IsolateSuite';
import { IsolateTest } from 'IsolateTest';
import { useEmit } from 'Runtime';
import { TestWalker } from 'TestWalker';

/**
 * This module gets triggered once the suite is done running its sync tests.
 *
 * It goes over all the tests in the state, and checks if they need to be omitted.
 */

export function useOmitOptionalFields(): void {
  const root = VestRuntime.useAvailableRoot<IsolateSuite>();
  const emit = useEmit();

  const optionalFields = root?.getOptionalFields();

  // If there are no optional fields, we don't need to do anything
  if (isEmpty(optionalFields)) {
    return;
  }

  // Create an object to store the fields that need to be omitted
  const shouldOmit = new Set<string>();

  // iterate over each of the tests in the state
  TestWalker.walkTests(testObject => {
    if (testObject.isPending()) {
      return;
    }
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

  emit(Events.DONE_TEST_OMISSION_PASS);

  function verifyAndOmit(testObject: IsolateTest) {
    if (shouldOmit.has(testObject.fieldName)) {
      testObject.omit();
      root?.setOptionalField(testObject.fieldName, current => ({
        ...current,
        applied: true,
      }));
    }
  }

  function runOptionalConfig(testObject: IsolateTest) {
    // Ge the optional configuration for the given field
    const optionalConfig = root?.getOptionalField(testObject.fieldName);

    if (isNullish(optionalConfig)) {
      return;
    }

    // If the optional was set to a function or a boolean, run it and verify/omit the test
    if (optionalFunctionValue(optionalConfig.rule) === true) {
      shouldOmit.add(testObject.fieldName);
    }

    verifyAndOmit(testObject);
  }
}
