import { bus, invariant } from 'vest-utils';

import VestTest from 'VestTest';
import ctx from 'ctx';
import hasRemainingTests from 'hasRemainingTests';
import matchingFieldName from 'matchingFieldName';
import omitOptionalFields from 'omitOptionalFields';
import removeTestFromState from 'removeTestFromState';
import { runFieldCallbacks, runDoneCallbacks } from 'runCallbacks';
import { useEachTestObject } from 'stateHooks';

// eslint-disable-next-line max-lines-per-function
export function initBus() {
  const vestBus = bus.createBus();

  // Report a the completion of a test. There may be other tests with the same
  // name that are still running, or not yet started.
  vestBus.on(Events.TEST_COMPLETED, (testObject: VestTest) => {
    if (testObject.isCanceled()) {
      return;
    }

    testObject.done();

    runFieldCallbacks(testObject.fieldName);

    if (!hasRemainingTests()) {
      // When no more tests are running, emit the done event
      vestBus.emit(Events.ALL_RUNNING_TESTS_FINISHED);
    }
  });

  // Report that the suite completed its synchronous test run.
  // Async operations may still be running.
  vestBus.on(Events.SUITE_CALLBACK_DONE_RUNNING, () => {
    // Remove tests that are optional and need to be omitted
    omitOptionalFields();
  });

  // Called when all the tests, including async, are done running
  vestBus.on(Events.ALL_RUNNING_TESTS_FINISHED, () => {
    runDoneCallbacks();
  });

  // Removes a certain field from the state.
  vestBus.on(Events.REMOVE_FIELD, (fieldName: string) => {
    useEachTestObject(testObject => {
      if (matchingFieldName(testObject, fieldName)) {
        testObject.cancel();
        removeTestFromState(testObject);
      }
    });
  });

  // Resets a certain field in the state.
  vestBus.on(Events.RESET_FIELD, (fieldName: string) => {
    useEachTestObject(testObject => {
      if (matchingFieldName(testObject, fieldName)) {
        testObject.reset();
      }
    });
  });

  return vestBus;
}

export function useBus() {
  const context = ctx.useX();

  invariant(context.bus);

  return context.bus;
}

export enum Events {
  TEST_COMPLETED = 'test_completed',
  ALL_RUNNING_TESTS_FINISHED = 'all_running_tests_finished',
  REMOVE_FIELD = 'remove_field',
  RESET_FIELD = 'reset_field',
  SUITE_CALLBACK_DONE_RUNNING = 'suite_callback_done_running',
}
