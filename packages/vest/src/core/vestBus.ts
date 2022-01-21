import { createBus } from 'bus';
import throwError from 'throwError';

import VestTest from 'VestTest';
import ctx from 'ctx';
import matchingFieldName from 'matchingFieldName';
import omitOptionalTests from 'omitOptionalTests';
import removeTestFromState from 'removeTestFromState';
import { runFieldCallbacks, runDoneCallbacks } from 'runCallbacks';
import { useEachTestObject } from 'stateHooks';

// eslint-disable-next-line max-lines-per-function
export function initBus() {
  const bus = createBus();

  // Report a the completion of a test. There may be other tests with the same
  // name that are still running, or not yet started.
  bus.on(Events.TEST_COMPLETED, (testObject: VestTest) => {
    if (testObject.isCanceled()) {
      return;
    }

    testObject.done();

    runFieldCallbacks(testObject.fieldName);
    runDoneCallbacks();
  });

  // Report that the suite completed its synchronous test run.
  // Async operations may still be running.
  bus.on(Events.SUITE_COMPLETED, () => {
    // Remove tests that are optional and need to be omitted
    omitOptionalTests();
  });

  // Removes a certain field from the state.
  bus.on(Events.REMOVE_FIELD, (fieldName: string) => {
    useEachTestObject(testObject => {
      if (matchingFieldName(testObject, fieldName)) {
        testObject.cancel();
        removeTestFromState(testObject);
      }
    });
  });

  // Resets a certain field in the state.
  bus.on(Events.RESET_FIELD, (fieldName: string) => {
    useEachTestObject(testObject => {
      if (matchingFieldName(testObject, fieldName)) {
        testObject.reset();
      }
    });
  });

  return bus;
}

export function useBus() {
  const context = ctx.useX();

  if (!context.bus) {
    throwError();
  }

  return context.bus;
}

export enum Events {
  TEST_COMPLETED = 'test_completed',
  REMOVE_FIELD = 'remove_field',
  RESET_FIELD = 'reset_field',
  SUITE_COMPLETED = 'suite_completed',
}
