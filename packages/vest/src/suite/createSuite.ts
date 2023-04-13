import { assign, CB } from 'vest-utils';

import { IsolateSuite } from 'IsolateSuite';
import {
  useCreateVestState,
  persist,
  PersistedContext,
  usePrepareEmitter,
  useEmit,
} from 'PersistedContext';
import { SuiteContext } from 'SuiteContext';
import {
  SuiteName,
  SuiteRunResult,
  TFieldName,
  TGroupName,
} from 'SuiteResultTypes';
import { Suite } from 'SuiteTypes';
import { Events } from 'VestBus';
import { getTypedMethods } from 'getTypedMethods';
import { useCreateSuiteResult } from 'suiteResult';
import { useSuiteRunResult } from 'suiteRunResult';
import { validateSuiteCallback } from 'validateSuiteParams';

function createSuite<
  T extends CB,
  F extends TFieldName = string,
  G extends TGroupName = string
>(suiteName: SuiteName, suiteCallback: T): Suite<T, F, G>;
function createSuite<
  T extends CB,
  F extends TFieldName = string,
  G extends TGroupName = string
>(suiteCallback: T): Suite<T, F, G>;
// @vx-allow use-use
function createSuite<
  T extends CB,
  F extends TFieldName = string,
  G extends TGroupName = string
>(
  ...args: [suiteName: SuiteName, suiteCallback: T] | [suiteCallback: T]
): Suite<T, F, G> {
  const [suiteCallback, suiteName] = args.reverse() as [T, SuiteName];

  validateSuiteCallback(suiteCallback);

  // Create a stateRef for the suite
  // It holds the suite's persisted values that may remain between runs.
  const stateRef = useCreateVestState({ suiteName });

  function suite(...args: Parameters<T>): SuiteRunResult<F, G> {
    return SuiteContext.run({}, () => {
      // eslint-disable-next-line vest-internal/use-use
      const emit = useEmit();

      emit(Events.SUITE_RUN_STARTED);

      return IsolateSuite.create(
        useRunSuiteCallback<T, F, G>(suiteCallback, ...args)
      );
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
        get: persist(useCreateSuiteResult),
        remove: usePrepareEmitter<string>(Events.REMOVE_FIELD),
        reset: usePrepareEmitter(Events.RESET_SUITE),
        resetField: usePrepareEmitter<string>(Events.RESET_FIELD),
        ...getTypedMethods(),
      }
    );
  });
}

function useRunSuiteCallback<
  T extends CB,
  F extends TFieldName,
  G extends TGroupName
>(suiteCallback: T, ...args: Parameters<T>): () => SuiteRunResult<F, G> {
  return () => {
    suiteCallback(...args);
    return useSuiteRunResult<F, G>();
  };
}

export { createSuite };
