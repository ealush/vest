import { assign, CB, invariant, isFunction } from 'vest-utils';

import {
  createVestState,
  persist,
  PersistedContext,
  prepareEmitter,
  useEmit,
} from 'PersistedContext';
import { SuiteContext } from 'SuiteContext';
import { SuiteResult, SuiteRunResult, TFieldName } from 'SuiteResultTypes';
import { Events } from 'VestBus';
import { Isolate } from 'isolate';
import { createSuiteResult } from 'suiteResult';
import { suiteRunResult } from 'suiteRunResult';

function createSuite<T extends CB, F extends TFieldName>(
  suiteName: SuiteName,
  suiteCallback: T
): Suite<T, F>;
function createSuite<T extends CB, F extends TFieldName>(
  suiteCallback: T
): Suite<T, F>;
function createSuite<T extends CB, F extends TFieldName>(
  ...args: [suiteName: SuiteName, suiteCallback: T] | [suiteCallback: T]
): Suite<T, F> {
  const [suiteCallback, suiteName] = args.reverse() as [T, SuiteName];

  validateSuiteCallback(suiteCallback);

  // Create a stateRef for the suite
  // It holds the suite's persisted values that may remain between runs.
  const stateRef = createVestState({ suiteName });

  function suite(...args: Parameters<T>): SuiteRunResult<F> {
    return SuiteContext.run({}, () => {
      const emit = useEmit();

      emit(Events.SUITE_RUN_STARTED);

      return Isolate.create(runSuiteCallback(...args));
    }).output;
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
        get: persist(createSuiteResult),
        remove: prepareEmitter<string>(Events.REMOVE_FIELD),
        reset: prepareEmitter(Events.RESET_SUITE),
        resetField: prepareEmitter<string>(Events.RESET_FIELD),
      }
    );
  });

  function runSuiteCallback(...args: Parameters<T>): () => SuiteRunResult<F> {
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

export type Suite<T extends CB, F extends TFieldName> = ((
  ...args: Parameters<T>
) => SuiteRunResult<F>) &
  SuiteMethods<F>;

type SuiteMethods<F extends TFieldName> = {
  get: () => SuiteResult<F>;
  reset: () => void;
  remove: (fieldName: F) => void;
  resetField: (fieldName: F) => void;
};

export { createSuite };
