import { CB, BusType, Failure, deferThrow } from 'vest-utils';
import { Bus, RuntimeEvents, TIsolate, VestRuntime } from 'vestjs-runtime';

import { useOmitOptionalFields } from '../../hooks/optional/omitOptionalFields';
import { TIsolateSuite } from '../isolate/IsolateSuite/IsolateSuite';
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
  const VestBus = Bus.useBus<VestEvents>();

  VestBus.on('TEST_COMPLETED', (isolate: TIsolate) => {
    useExpireSuiteResultCache();

    // #FIXME: This is not ideal as it traverses up all the way on every test
    // but for now it should be ok. O(n)
    // The reason we're doing this is that whenever tests are declared anywhere that's not the top level
    // we still need them to be accessible from the root level tests[] array.
    // This is because all of the runtime checks related to execution mode and early exit (eager, one, lazy)
    // occur and are based on the top level registry instead of needing to always traverse all the way down.
    registerTestsTraverseUp(isolate);
  });

  VestBus.on('TEST_RUN_STARTED', () => {
    useExpireSuiteResultCache();

    // Bringing this back due to https://github.com/ealush/vest/issues/1157
    // This is a very peculiar bug in which we're seeing vest behaving differently between
    // runs when suite.get() is called.
    // In the bug we experienced that failing tests were skipped in the second run.
    // The reason: suite.get() built the failures cache. Calling suite.get() before the test run
    // made Vest think that the field already had failing tests (even though it was the same test!)
    // and it skipped the test.
    // A better solution is to be able to identify each failure to its actual position in the suite
    // but this requires some re-architecting within Vest.
    // This is an easy enough solution - we just reset the cache before the test run, let's hope we don't see
    // any performance issues.
  });

  VestBus.on('ISOLATE_ENTER', (isolate: TIsolate) => {
    if (VestTest.is(isolate)) {
      onTestStart(isolate);
    }
  });

  VestBus.on('ISOLATE_RECONCILED', (isolate: TIsolate) => {
    registerTestNodes(isolate);
  });

  VestBus.on('ISOLATE_DONE', (isolate: TIsolate) => {
    if (VestTest.is(isolate)) {
      VestBus.emit('TEST_COMPLETED', isolate);
    } else {
      registerTestNodes(isolate);
    }
  });

  VestBus.on('ASYNC_ISOLATE_DONE', (isolate: TIsolate) => {
    if (VestTest.is(isolate)) {
      if (!VestTest.isCanceled(isolate).unwrap()) {
        const { fieldName } = VestTest.getData(isolate);

        useRunFieldCallbacks(fieldName);
        useRunDoneCallbacks();
      }
    }

    if (VestRuntime.useIsStable()) {
      // When no more async tests are running, emit the done event
      VestBus.emit('ALL_RUNNING_TESTS_FINISHED');
    }
  });

  VestBus.on('DONE_TEST_OMISSION_PASS', () => {
    /* We NEED to refresh the cache here. Don't ask */
    useExpireSuiteResultCache();
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
    const root = VestRuntime.useAvailableRoot<TIsolateSuite>();
    if (root) {
      root.data.resolver();
    }
  });

  VestBus.on('DEFER_THROW', (failure: Failure<any, any>) => {
    failure.mapError(deferThrow);
  });

  VestBus.on('RESET_FIELD', (fieldName: TFieldName) => {
    useExpireSuiteResultCache();

    TestWalker.resetField(fieldName);
  });

  VestBus.on('SUITE_RUN_STARTED', () => {
    useExpireSuiteResultCache();
  });

  VestBus.on('INITIALIZING_CALLBACKS', () => {
    useExpireSuiteResultCache();
    useResetCallbacks();
  });

  VestBus.on('SUITE_CALLBACK_RUN_FINISHED', () => {
    useExpireSuiteResultCache();

    if (VestRuntime.useIsStable()) {
      // When no more async tests are running, emit the done event
      VestBus.emit('ALL_RUNNING_TESTS_FINISHED');
    }

    useOmitOptionalFields();
    useRunSyncFieldCallbacks();
    useRunDoneCallbacks();
  });

  VestBus.on('REMOVE_FIELD', (fieldName: TFieldName) => {
    useExpireSuiteResultCache();

    TestWalker.removeTestByFieldName(fieldName);
    reprocessTree(VestRuntime.useAvailableRoot());
  });

  VestBus.on('RESET_SUITE', () => {
    useResetSuite();
  });

  return {
    subscribe,
  };

  function subscribe<T extends keyof VestEvents>(
    event: T,
    cb: (payload: VestEvents[T]) => void,
  ): CB<void>;
  function subscribe(cb: CB): CB<void>;
  function subscribe(
    ...args: [event: keyof VestEvents, cb: CB] | [cb: CB]
  ): CB<void> {
    const [cb, event] = args.reverse() as [CB, keyof VestEvents];

    // @ts-ignore - Argument type mismatch due to wildcard handling complexity
    return VestBus.on(event ?? '*', () => {
      cb();
    }).off;
  }
}

export function useEmit(): BusType<VestEvents>['emit'];
export function useEmit<T extends keyof VestEvents>(
  event: T,
  ...args: VestEvents[T] extends void
    ? [payload?: VestEvents[T]]
    : [payload: VestEvents[T]]
): void;
export function useEmit(event?: keyof VestEvents, data?: any): any {
  return Bus.useEmit<VestEvents>(event!, data);
}

export function usePrepareEmitter<T extends keyof VestEvents>(
  event: T,
): (arg: VestEvents[T]) => void {
  return Bus.usePrepareEmitter<VestEvents>(event);
}

export type VestEvents = Events & RuntimeEvents;

export type Subscribe = {
  <T extends keyof VestEvents>(
    event: T,
    cb: (payload: VestEvents[T]) => void,
  ): CB<void>;
  (cb: CB): CB<void>;
};
