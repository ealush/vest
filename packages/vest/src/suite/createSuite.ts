import { assign, CB, invariant, isFunction } from 'vest-utils';

import { IsolateTypes } from 'IsolateTypes';
import {
  createVestState,
  persist,
  PersistedContext,
  prepareEmitter,
  useEmit,
} from 'PersistedContext';
import { SuiteContext } from 'SuiteContext';
import { SuiteResult, SuiteRunResult } from 'SuiteResultTypes';
import { Events } from 'VestBus';
import { isolate } from 'isolate';
import { suiteResult } from 'suiteResult';
import { suiteRunResult } from 'suiteRunResult';

function createSuite<T extends CB>(
  suiteName: SuiteName,
  suiteCallback: T
): Suite<T>;
function createSuite<T extends CB>(suiteCallback: T): Suite<T>;
function createSuite<T extends CB>(
  ...args: [suiteName: SuiteName, suiteCallback: T] | [suiteCallback: T]
): Suite<T> {
  const [suiteCallback, suiteName] = args.reverse() as [T, SuiteName];

  validateSuiteCallback(suiteCallback);

  // Create a stateRef for the suite
  // It holds the suite's persisted values that may remain between runs.
  const stateRef = createVestState({ suiteName });

  function suite(...args: Parameters<T>): SuiteRunResult {
    const [, output] = SuiteContext.run({}, () => {
      const emit = useEmit();

      emit(Events.SUITE_RUN_STARTED);

      return isolate(IsolateTypes.SUITE, runSuiteCallback(...args));
    });

    return output;
  }

  // Assign methods to the suite
  // We do this within the PersistedContext so that the suite methods
  // will be bound to the suite's stateRef and be able to access it.
  return PersistedContext.run(stateRef, () => {
    return assign(
      // We're also binding the suite to the stateRef, so that the suite
      // can access the stateRef when it's called.
      PersistedContext.bind(stateRef, suite),
      {
        get: persist(suiteResult),
        remove: prepareEmitter<string>(Events.REMOVE_FIELD),
        reset: prepareEmitter(Events.RESET_SUITE),
        resetField: prepareEmitter<string>(Events.RESET_FIELD),
      }
    );
  });

  function runSuiteCallback(...args: Parameters<T>): () => SuiteRunResult {
    return () => {
      suiteCallback(...args);
      return suiteRunResult();
    };
  }
}

function validateSuiteCallback<T extends CB>(
  suiteCallback: T
): asserts suiteCallback is T {
  invariant(
    isFunction(suiteCallback),
    'vest.create: Expected callback to be a function.'
  );
}

export type SuiteName = string | undefined;

export type Suite<T extends CB> = ((...args: Parameters<T>) => SuiteRunResult) &
  SuiteMethods;

type SuiteMethods = {
  get: () => SuiteResult;
  reset: () => void;
  remove: (fieldName: string) => void;
  resetField: (fieldName: string) => void;
};

export { createSuite };
