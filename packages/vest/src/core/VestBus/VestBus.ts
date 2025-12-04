import { CB, ValueOf } from 'vest-utils';
import { Bus, RuntimeEvents, TIsolate, VestRuntime } from 'vestjs-runtime';

import { useOmitOptionalFields } from '../../hooks/optional/omitOptionalFields';
import { SuiteWalker } from '../../suite/SuiteWalker';
import {
  useRunDoneCallbacks,
  useRunFieldCallbacks,
  useRunSyncFieldCallbacks,
} from '../../suite/runCallbacks';
import { TFieldName } from '../../suiteResult/SuiteResultTypes';
import {
  useExpireSuiteResultCache,
  useResetCallbacks,
  useResetSuite,
} from '../Runtime';
import { TestWalker } from '../isolate/IsolateTest/TestWalker';
import { VestTest } from '../isolate/IsolateTest/VestTest';

import {
  registerTestsTraverseUp,
  registerTestNodes,
  onTestStart,
  reprocessTree,
} from '../isolate/registerTests';

import { Events } from './BusEvents';

// eslint-disable-next-line max-statements, max-lines-per-function
export function useInitVestBus() {
  const VestBus = Bus.useBus();

  on('TEST_COMPLETED', (isolate: TIsolate) => {
    // #FIXME: This is not ideal as it traverses up all the way on every test
    // but for now it should be ok. O(n)
    // The reason we're doing this is that whenever tests are declared anywhere that's not the top level
    // we still need them to be accessible from the root level tests[] array.
    // This is becaue all of the runtime checks related to execution mode and early exit (eager, one, lazy)
    // occur and are based on the top level registry instead of needing to always traverse all the way down.
    registerTestsTraverseUp(isolate);
  });

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

  VestBus.on(RuntimeEvents.ISOLATE_ENTER, (isolate: TIsolate) => {
    if (VestTest.is(isolate)) {
      onTestStart(isolate);
    }
  });

  VestBus.on(RuntimeEvents.ISOLATE_RECONCILED, (isolate: TIsolate) => {
    registerTestNodes(isolate);
  });

  VestBus.on(RuntimeEvents.ISOLATE_DONE, (isolate: TIsolate) => {
    if (VestTest.is(isolate)) {
      VestBus.emit('TEST_COMPLETED', isolate);
    } else {
      registerTestNodes(isolate);
    }
  });

  VestBus.on(RuntimeEvents.ASYNC_ISOLATE_DONE, (isolate: TIsolate) => {
    if (VestTest.is(isolate)) {
      if (!VestTest.isCanceled(isolate).unwrap()) {
        const { fieldName } = VestTest.getData(isolate);

        useRunFieldCallbacks(fieldName);
        useRunDoneCallbacks();
      }
    }

    if (!SuiteWalker.useHasPending()) {
      // When no more async tests are running, emit the done event
      VestBus.emit('ALL_RUNNING_TESTS_FINISHED', isolate);
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

    // resolve the suite's promise
    SuiteWalker.useResolve();
  });

  on('RESET_FIELD', (fieldName: TFieldName) => {
    TestWalker.resetField(fieldName);
  });

  on('SUITE_RUN_STARTED', () => {});

  on('INITIALIZING_CALLBACKS', () => {
    useResetCallbacks();
  });

  on('SUITE_CALLBACK_RUN_FINISHED', (isolate: TIsolate) => {
    if (VestRuntime.useIsStable()) {
      // When no more async tests are running, emit the done event
      VestBus.emit('ALL_RUNNING_TESTS_FINISHED', isolate);
    }

    useOmitOptionalFields();
    useRunSyncFieldCallbacks();
    useRunDoneCallbacks();
  });

  on('REMOVE_FIELD', (fieldName: TFieldName) => {
    TestWalker.removeTestByFieldName(fieldName);
    reprocessTree(VestRuntime.useAvailableRoot());
  });

  on('RESET_SUITE', () => {
    useResetSuite();
  });

  return {
    subscribe,
  };

  function subscribe(event: VestEvents, cb: CB): CB<void>;
  function subscribe(cb: CB): CB<void>;
  function subscribe(
    ...args: [event: VestEvents, cb: CB] | [cb: CB]
  ): CB<void> {
    const [cb, event] = args.reverse() as [CB, VestEvents];
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
  (event: VestEvents, cb: CB): CB<void>;
  (cb: CB): CB<void>;
};
