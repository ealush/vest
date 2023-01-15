import { bus } from 'vest-utils';

import {
  useExpireSuiteResultCache,
  useResetCallbacks,
  useResetSuite,
} from 'PersistedContext';
import { TestWalker } from 'SuiteWalker';
import { VestTest } from 'VestTest';
import { runDoneCallbacks, runFieldCallbacks } from 'runCallbacks';

// eslint-disable-next-line max-lines-per-function
export function initVestBus() {
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

  on(Events.TEST_RUN_STARTED, () => {
    /* Let's just invalidate the suite cache for now */
  });

  // Called when all the tests, including async, are done running
  on(Events.ALL_RUNNING_TESTS_FINISHED, () => {
    runDoneCallbacks();
  });

  on(Events.RESET_FIELD, (fieldName: string) => {
    TestWalker.resetField(fieldName);
  });

  on(Events.SUITE_RUN_STARTED, () => {
    useResetCallbacks();
  });

  on(Events.REMOVE_FIELD, (fieldName: string) => {
    TestWalker.removeTestByFieldName(fieldName);
  });

  on(Events.RESET_SUITE, () => {
    useResetSuite();
  });

  return VestBus;

  function on(event: Events, cb: (...args: any[]) => void) {
    VestBus.on(event, (...args: any[]) => {
      // This is more concise, but it might be an overkill
      // if we're adding events that don't need to invalidate the cache
      useExpireSuiteResultCache();
      cb(...args);
    });
  }
}

export enum Events {
  TEST_RUN_STARTED = 'test_run_started',
  TEST_COMPLETED = 'test_completed',
  ALL_RUNNING_TESTS_FINISHED = 'all_running_tests_finished',
  REMOVE_FIELD = 'remove_field',
  RESET_FIELD = 'reset_field',
  RESET_SUITE = 'reset_suite',
  SUITE_CALLBACK_DONE_RUNNING = 'suite_callback_done_running', // TODO: IMPLEMENT
  SUITE_RUN_STARTED = 'suite_run_started',
}
