import { bus } from 'vest-utils';

import { Events } from 'BusEvents';
import { IsolateTest } from 'IsolateTest';
import {
  useExpireSuiteSummaryCache,
  useResetCallbacks,
  useResetSuite,
} from 'PersistedContext';
import { TFieldName } from 'SuiteResultTypes';
import { TestWalker } from 'TestWalker';
import { useRunDoneCallbacks, useRunFieldCallbacks } from 'runCallbacks';

export function useInitVestBus() {
  const VestBus = bus.createBus();

  // Report a the completion of a test. There may be other tests with the same
  // name that are still running, or not yet started.
  on(Events.TEST_COMPLETED, (testObject: IsolateTest) => {
    if (testObject.isCanceled()) {
      return;
    }

    useRunFieldCallbacks(testObject.fieldName);

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
    useRunDoneCallbacks();
  });

  on(Events.RESET_FIELD, (fieldName: TFieldName) => {
    TestWalker.resetField(fieldName);
  });

  on(Events.SUITE_RUN_STARTED, () => {
    useResetCallbacks();
  });

  on(Events.REMOVE_FIELD, (fieldName: TFieldName) => {
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
      useExpireSuiteSummaryCache();
      cb(...args);
    });
  }
}
