import { assign, CB } from 'vest-utils';
import { Bus, VestRuntime } from 'vestjs-runtime';

import { Events } from 'BusEvents';
import { IsolateSuite } from 'IsolateSuite';
import { useCreateVestState, useLoadSuite } from 'Runtime';
import { SuiteContext } from 'SuiteContext';
import {
  SuiteName,
  SuiteRunResult,
  TFieldName,
  TGroupName,
} from 'SuiteResultTypes';
import { Suite } from 'SuiteTypes';
import { useInitVestBus } from 'VestBus';
import { VestReconciler } from 'VestReconciler';
import { getTypedMethods } from 'getTypedMethods';
import { useCreateSuiteResult } from 'suiteResult';
import { useSuiteRunResult } from 'suiteRunResult';
import { bindSuiteSelectors } from 'suiteSelectors';
import { validateSuiteCallback } from 'validateSuiteParams';

function createSuite<
  F extends TFieldName = string,
  G extends TGroupName = string,
  T extends CB = CB
>(suiteName: SuiteName, suiteCallback: T): Suite<F, G, T>;
function createSuite<
  F extends TFieldName = string,
  G extends TGroupName = string,
  T extends CB = CB
>(suiteCallback: T): Suite<F, G, T>;
// @vx-allow use-use
function createSuite<
  F extends TFieldName = string,
  G extends TGroupName = string,
  T extends CB = CB
>(
  ...args: [suiteName: SuiteName, suiteCallback: T] | [suiteCallback: T]
): Suite<F, G, T> {
  const [suiteCallback, suiteName] = args.reverse() as [T, SuiteName];

  validateSuiteCallback(suiteCallback);

  // Create a stateRef for the suite
  // It holds the suite's persisted values that may remain between runs.
  const stateRef = useCreateVestState({ suiteName, VestReconciler });

  function suite(...args: Parameters<T>): SuiteRunResult<F, G> {
    return SuiteContext.run(
      {
        suiteParams: args,
      },
      () => {
        Bus.useEmit(Events.SUITE_RUN_STARTED);

        return IsolateSuite(
          useRunSuiteCallback<T, F, G>(suiteCallback, ...args)
        );
      }
    ).output;
  }

  // Assign methods to the suite
  // We do this within the VestRuntime so that the suite methods
  // will be bound to the suite's stateRef and be able to access it.
  return VestRuntime.Run(stateRef, () => {
    useInitVestBus();

    return assign(
      // We're also binding the suite to the stateRef, so that the suite
      // can access the stateRef when it's called.
      VestRuntime.persist(suite),
      {
        get: VestRuntime.persist(useCreateSuiteResult),
        load: VestRuntime.persist(useLoadSuite),
        remove: Bus.usePrepareEmitter<string>(Events.REMOVE_FIELD),
        reset: Bus.usePrepareEmitter(Events.RESET_SUITE),
        resetField: Bus.usePrepareEmitter<string>(Events.RESET_FIELD),
        ...bindSuiteSelectors<F, G>(VestRuntime.persist(useCreateSuiteResult)),
        ...getTypedMethods<F, G>(),
      }
    );
  });
}

function useRunSuiteCallback<
  T extends CB,
  F extends TFieldName,
  G extends TGroupName
>(suiteCallback: T, ...args: Parameters<T>): CB<SuiteRunResult<F, G>> {
  const emit = Bus.useEmit();

  return () => {
    suiteCallback(...args);
    emit(Events.SUITE_CALLBACK_RUN_FINISHED);
    return useSuiteRunResult<F, G>();
  };
}

export { createSuite };
