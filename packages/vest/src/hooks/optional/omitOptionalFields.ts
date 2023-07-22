import { isEmpty, optionalFunctionValue } from 'vest-utils';
import { Bus, VestRuntime } from 'vestjs-runtime';

import { Events } from 'BusEvents';
import { SuiteOptionalFields, TIsolateSuite } from 'IsolateSuite';
import { TIsolateTest } from 'IsolateTest';
import { TestWalker } from 'TestWalker';
import { VestTestInspector } from 'VestTestInspector';
import { VestTestMutator } from 'VestTestMutator';

/**
 * This module gets triggered once the suite is done running its sync tests.
 *
 * It goes over all the tests in the state, and checks if they need to be omitted.
 */

export function useOmitOptionalFields(): void {
  const root = VestRuntime.useAvailableRoot<TIsolateSuite>();

  const optionalFields = SuiteOptionalFields.getOptionalFields(root);

  // If there are no optional fields, we don't need to do anything
  if (isEmpty(optionalFields)) {
    return;
  }

  // Create an object to store the fields that need to be omitted
  const shouldOmit = new Set<string>();

  // iterate over each of the tests in the state
  TestWalker.walkTests(testObject => {
    if (VestTestInspector.isPending(testObject)) {
      return;
    }
    const { fieldName } = VestTestInspector.getData(testObject);

    // If we already added the current field (not this test specifically)
    // no need for further checks, go and omit the test
    if (shouldOmit.has(fieldName)) {
      verifyAndOmit(testObject);
    } else {
      // check if the field has an optional function
      // if so, run it and verify/omit the test
      runOptionalConfig(testObject);
    }
  });

  Bus.useEmit(Events.DONE_TEST_OMISSION_PASS);

  function verifyAndOmit(testObject: TIsolateTest) {
    const { fieldName } = VestTestInspector.getData(testObject);
    if (shouldOmit.has(fieldName)) {
      VestTestMutator.omit(testObject);
      SuiteOptionalFields.setOptionalField(root, fieldName, current => ({
        ...current,
        applied: true,
      }));
    }
  }

  function runOptionalConfig(testObject: TIsolateTest) {
    const { fieldName } = VestTestInspector.getData(testObject);

    // Ge the optional configuration for the given field
    const optionalConfig = SuiteOptionalFields.getOptionalField(
      root,
      fieldName
    );

    // If the optional was set to a function or a boolean, run it and verify/omit the test
    if (optionalFunctionValue(optionalConfig.rule) === true) {
      shouldOmit.add(fieldName);
    }

    verifyAndOmit(testObject);
  }
}
