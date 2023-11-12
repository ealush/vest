import { CB, ValueOf } from 'vest-utils';
import { Bus, RuntimeEvents, TIsolate } from 'vestjs-runtime';

import { Events } from 'BusEvents';
import * as CommonStateMachine from 'CommonStateMachine';
import { TIsolateTest } from 'IsolateTest';
import {
  useExpireSuiteResultCache,
  useResetCallbacks,
  useResetSuite,
} from 'Runtime';
import { TFieldName } from 'SuiteResultTypes';
import { TestWalker } from 'TestWalker';
import { VestTest } from 'VestTest';
import { useOmitOptionalFields } from 'omitOptionalFields';
import { useRunDoneCallbacks, useRunFieldCallbacks } from 'runCallbacks';

// eslint-disable-next-line max-statements, max-lines-per-function
export function useInitVestBus() {
  const VestBus = Bus.useBus();

  // Report a the completion of a test. There may be other tests with the same
  // name that are still running, or not yet started.
  on(Events.TEST_COMPLETED, (testObject: TIsolateTest) => {
    if (VestTest.isCanceled(testObject)) {
      return;
    }

    const { fieldName } = VestTest.getData(testObject);

    useRunFieldCallbacks(fieldName);

    if (!TestWalker.hasRemainingTests()) {
      // When no more tests are running, emit the done event
      VestBus.emit(Events.ALL_RUNNING_TESTS_FINISHED);
    }
  });

  on(Events.TEST_RUN_STARTED, () => {
    /* Let's just invalidate the suite cache for now */
  });

  on(RuntimeEvents.ISOLATE_PENDING, (isolate: TIsolate) => {
    if (VestTest.is(isolate)) {
      VestTest.setPending(isolate);
    }

    CommonStateMachine.setPending(isolate);
  });

  on(RuntimeEvents.ISOLATE_DONE, (isolate: TIsolate) => {
    if (VestTest.is(isolate)) {
      VestBus.emit(Events.TEST_COMPLETED, isolate);
    }

    CommonStateMachine.setDone(isolate);
  });

  on(Events.DONE_TEST_OMISSION_PASS, () => {
    /* We NEED to refresh the cache here. Don't ask */
  });

  // Called when all the tests, including async, are done running
  on(Events.ALL_RUNNING_TESTS_FINISHED, () => {
    // Small optimization. We don't need to run this if there are no async tests
    // The reason is that we run this function immediately after the suite callback
    // is run, so if the suite is only comprised of sync tests, we don't need to
    // run this function twice since we know for a fact the state is up to date
    if (TestWalker.someTests(VestTest.isAsyncTest)) {
      useOmitOptionalFields();
    }
    useRunDoneCallbacks();
  });

  on(Events.RESET_FIELD, (fieldName: TFieldName) => {
    TestWalker.resetField(fieldName);
  });

  on(Events.SUITE_RUN_STARTED, () => {
    useResetCallbacks();
  });

  on(Events.SUITE_CALLBACK_RUN_FINISHED, () => {
    useOmitOptionalFields();
  });

  on(Events.REMOVE_FIELD, (fieldName: TFieldName) => {
    TestWalker.removeTestByFieldName(fieldName);
  });

  on(Events.RESET_SUITE, () => {
    useResetSuite();
  });

  return {
    subscribe,
  };

  function subscribe(cb: CB) {
    return VestBus.on('*', () => {
      cb();
    }).off;
  }

  function on(event: VestEvents, cb: (...args: any[]) => void) {
    VestBus.on(event, (...args: any[]) => {
      // This is more concise, but it might be an overkill
      // if we're adding events that don't need to invalidate the cache
      useExpireSuiteResultCache();
      cb(...args);
    });
  }
}

type VestEvents = Events | ValueOf<typeof RuntimeEvents> | '*';
