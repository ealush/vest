import { CB, ValueOf } from 'vest-utils';
import { Bus, RuntimeEvents, TIsolate } from 'vestjs-runtime';

import { Events } from 'BusEvents';
// import { TIsolateTest } from 'IsolateTest';
import { useExpireSuiteResultCache, useResetSuite } from 'Runtime';
import { TFieldName } from 'SuiteResultTypes';
import { SuiteWalker } from 'SuiteWalker';
import { TestWalker } from 'TestWalker';
import { VestIsolate } from 'VestIsolate';
import { VestTest } from 'VestTest';
import { useOmitOptionalFields } from 'omitOptionalFields';
import { useRunDoneCallbacks } from 'runCallbacks';

// eslint-disable-next-line max-statements, max-lines-per-function
export function useInitVestBus() {
  const VestBus = Bus.useBus();

  on('TEST_COMPLETED', () => {});

  on('TEST_RUN_STARTED', () => {
    // Bringin this back due to https://github.com/ealush/vest/issues/1157
    // This is a very pecluiar bug in which we're seeing vest behaving differently between
    // runs when suite.get() is called.
    // In the bug we experienced that failing tests were skipped in the second run.
    // The reason: suite.get() built the failures cache. Calling suite.get() before the test run
    // made Vest think that the field already had failing tests (even though it was the same test!)
    // and it skipped the test.
    // A better solution is to be able to identify each failure to its actual position in the suite
    // but this requires some rearchitecting within Vest.
    // This is an easy enough solution - we just reset the cache before the test run, let's hope we don't see
    // any performance issues.
  });

  VestBus.on(RuntimeEvents.ISOLATE_PENDING, (isolate: TIsolate) => {
    if (VestTest.is(isolate)) {
      VestTest.setPending(isolate);
    }

    VestIsolate.setPending(isolate);
  });

  VestBus.on(RuntimeEvents.ISOLATE_DONE, (isolate: TIsolate) => {
    if (VestTest.is(isolate)) {
      VestBus.emit('TEST_COMPLETED', isolate);
    }

    VestIsolate.setDone(isolate);
  });

  VestBus.on(RuntimeEvents.ASYNC_ISOLATE_DONE, () => {
    if (!SuiteWalker.useHasPending()) {
      // When no more async tests are running, emit the done event
      VestBus.emit('ALL_RUNNING_TESTS_FINISHED');
    }
  });

  on('DONE_TEST_OMISSION_PASS', () => {
    /* We NEED to refresh the cache here. Don't ask */
  });

  // Called when all the tests, including async, are done running
  VestBus.on('ALL_RUNNING_TESTS_FINISHED', () => {
    // Small optimization. We don't need to run this if there are no async tests
    // The reason is that we run this function immediately after the suite callback
    // is run, so if the suite is only comprised of sync tests, we don't need to
    // run this function twice since we know for a fact the state is up to date
    if (TestWalker.someTests(VestTest.isAsyncTest)) {
      useOmitOptionalFields();
    }
    useRunDoneCallbacks();
  });

  on('RESET_FIELD', (fieldName: TFieldName) => {
    TestWalker.resetField(fieldName);
  });

  on('SUITE_RUN_STARTED', () => {
    // useResetCallbacks();
  });

  on('SUITE_CALLBACK_RUN_FINISHED', () => {
    if (!SuiteWalker.useHasPending()) {
      // When no more async tests are running, emit the done event
      VestBus.emit('ALL_RUNNING_TESTS_FINISHED');
    }

    useOmitOptionalFields();
  });

  on('REMOVE_FIELD', (fieldName: TFieldName) => {
    TestWalker.removeTestByFieldName(fieldName);
  });

  on('RESET_SUITE', () => {
    useResetSuite();
  });

  return {
    subscribe,
  };

  function subscribe(event: Events, cb: CB): CB<void>;
  function subscribe(cb: CB): CB<void>;
  function subscribe(...args: [event: Events, cb: CB] | [cb: CB]): CB<void> {
    const [cb, event] = args.reverse() as [CB, Events];
    return VestBus.on(event ?? '*', () => {
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

export type Subscribe = {
  (event: Events, cb: CB): CB<void>;
  (cb: CB): CB<void>;
};
