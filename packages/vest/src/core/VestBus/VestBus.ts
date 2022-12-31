import { bus } from 'vest-utils';

import { PersistedContext, resetCallbacks } from 'PersistedContext';
import { TestWalker } from 'SuiteWalker';
import { VestTest } from 'VestTest';
import { runDoneCallbacks, runFieldCallbacks } from 'runCallbacks';

export function initVestBus(ctxRef: any) {
  const VestBus = bus.createBus();

  // Report a the completion of a test. There may be other tests with the same
  // name that are still running, or not yet started.
  on(Events.TEST_COMPLETED, (testObject: VestTest) => {
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
  on(Events.ALL_RUNNING_TESTS_FINISHED, () => {
    runDoneCallbacks();
  });

  on(Events.RESET_FIELD, (fieldName: string) => {
    TestWalker.resetField(fieldName);
  });

  on(Events.SUITE_RUN_STARTED, () => {
    resetCallbacks();
  });

  return VestBus;

  function on(event: Events, callback: (...args: any[]) => void) {
    VestBus.on(event, PersistedContext.bind(ctxRef, callback));
  }
}

export enum Events {
  TEST_COMPLETED = 'test_completed',
  ALL_RUNNING_TESTS_FINISHED = 'all_running_tests_finished',
  REMOVE_FIELD = 'remove_field', // TODO: IMPLEMENT
  RESET_FIELD = 'reset_field',
  SUITE_CALLBACK_DONE_RUNNING = 'suite_callback_done_running', // TODO: IMPLEMENT
  SUITE_RUN_STARTED = 'suite_run_started',
}
