import { bus } from 'vest-utils';

import { useResetCallbacks, useResetSuite } from 'PersistedContext';
import { TestWalker } from 'SuiteWalker';
import { VestTest } from 'VestTest';
import { runDoneCallbacks, runFieldCallbacks } from 'runCallbacks';

export function initVestBus() {
  const VestBus = bus.createBus();

  // Report a the completion of a test. There may be other tests with the same
  // name that are still running, or not yet started.
  VestBus.on(Events.TEST_COMPLETED, (testObject: VestTest) => {
    if (testObject.isCanceled()) {
      return;
    }

    testObject.done();

    runFieldCallbacks(testObject.fieldName);

    if (!TestWalker.hasRemainingTests()) {
      // When no more tests are running, emit the done event
      VestBus.emit(Events.ALL_RUNNING_TESTS_FINISHED);
    }
  });

  // Called when all the tests, including async, are done running
  VestBus.on(Events.ALL_RUNNING_TESTS_FINISHED, () => {
    runDoneCallbacks();
  });

  VestBus.on(Events.RESET_FIELD, (fieldName: string) => {
    TestWalker.resetField(fieldName);
  });

  VestBus.on(Events.SUITE_RUN_STARTED, () => {
    useResetCallbacks();
  });

  VestBus.on(Events.REMOVE_FIELD, (fieldName: string) => {
    TestWalker.removeTestByFieldName(fieldName);
  });

  VestBus.on(Events.RESET_SUITE, () => {
    useResetSuite();
  });

  return VestBus;
}

export enum Events {
  TEST_COMPLETED = 'test_completed',
  ALL_RUNNING_TESTS_FINISHED = 'all_running_tests_finished',
  REMOVE_FIELD = 'remove_field',
  RESET_FIELD = 'reset_field',
  RESET_SUITE = 'reset_suite',
  SUITE_CALLBACK_DONE_RUNNING = 'suite_callback_done_running', // TODO: IMPLEMENT
  SUITE_RUN_STARTED = 'suite_run_started',
}