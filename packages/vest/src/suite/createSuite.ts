import { asArray, CB, assign, noop } from 'vest-utils';
import { Bus, VestRuntime } from 'vestjs-runtime';

import { getTypedMethods } from './getTypedMethods';

import { IsolateSuite, TIsolateSuite } from 'IsolateSuite';
import { useCreateVestState, useLoadSuite } from 'Runtime';
import { SuiteContext } from 'SuiteContext';
import {
  SuiteName,
  SuiteResult,
  TFieldName,
  TGroupName,
} from 'SuiteResultTypes';
import { AfterMethods, Suite } from 'SuiteTypes';
import { useInitVestBus } from 'VestBus';
import { VestReconciler } from 'VestReconciler';
import { useDeferDoneCallback } from 'deferDoneCallback';
import { useCreateSuiteResult } from 'suiteResult';
import { bindSuiteSelectors } from 'suiteSelectors';
import { validateSuiteCallback } from 'validateSuiteParams';

function createSuite<
  F extends TFieldName = string,
  G extends TGroupName = string,
  T extends CB = CB,
>(suiteName: SuiteName, suiteCallback: T): Suite<F, G, T>;
function createSuite<
  F extends TFieldName = string,
  G extends TGroupName = string,
  T extends CB = CB,
>(suiteCallback: T): Suite<F, G, T>;
// @vx-allow use-use
// eslint-disable-next-line max-lines-per-function
function createSuite<
  F extends TFieldName = string,
  G extends TGroupName = string,
  T extends CB = CB,
>(
  ...args: [suiteName: SuiteName, suiteCallback: T] | [suiteCallback: T]
): Suite<F, G, T> {
  const [suiteCallback, suiteName] = asArray(args).reverse() as [T, SuiteName];

  validateSuiteCallback(suiteCallback);

  // Create a stateRef for the suite
  // It holds the suite's persisted values that may remain between runs.
  const stateRef = useCreateVestState({ suiteName, VestReconciler });

  function runSuite(...args: Parameters<T>): SuiteResult<F, G> {
    let resolver: CB = noop;
    const promise = new Promise<SuiteResult<F, G>>(resolve => {
      resolver = resolve;
    });
    return assign(
      promise,
      SuiteContext.run(
        {
          suiteParams: args,
        },
        () => {
          Bus.useEmit('SUITE_RUN_STARTED');

          function resolve() {
            return resolver(useCreateSuiteResult<F, G>());
          }

          return IsolateSuite(() => {
            suiteCallback(...args);
            Bus.useEmit('SUITE_CALLBACK_RUN_FINISHED');
            return useCreateSuiteResult<F, G>();
          }, resolve);
        },
      ).output,
    );
  }

  // Assign methods to the suite
  // We do this within the VestRuntime so that the suite methods
  // will be bound to the suite's stateRef and be able to access it.
  return VestRuntime.Run(stateRef, () => {
    const persistedRun = VestRuntime.persist(runSuite);

    // @vx-allow use-use
    const VestBus = useInitVestBus();

    return {
      after: VestRuntime.persist(after),
      afterField: VestRuntime.persist(afterField),
      dump: VestRuntime.persist(VestRuntime.useAvailableRoot<TIsolateSuite>),
      get: VestRuntime.persist(useCreateSuiteResult<F, G>),
      remove: Bus.usePrepareEmitter<string>('REMOVE_FIELD'),
      reset: Bus.usePrepareEmitter('RESET_SUITE'),
      resetField: Bus.usePrepareEmitter<string>('RESET_FIELD'),
      resume: VestRuntime.persist(useLoadSuite),
      // We're also binding the suite to the stateRef, so that the suite
      // can access the stateRef when it's called.
      run: persistedRun,
      subscribe: VestBus.subscribe,
      ...bindSuiteSelectors<F, G>(VestRuntime.persist(useCreateSuiteResult)),
      ...getTypedMethods<F, G>(),
    };

    function afterField(fieldName: F, cb: CB) {
      return addAfter(cb, fieldName);
    }

    function after(cb: CB) {
      return addAfter(cb);
    }

    function addAfter(cb: CB, fieldName?: F) {
      Bus.useEmit('INITIALIZING_CALLBACKS');
      const returnValue = {
        run: persistedRun,
        after: VestRuntime.persist(after),
        afterField: VestRuntime.persist(afterField),
      };

      add(cb, fieldName);

      return returnValue;

      function add(cb: CB, fieldName?: F) {
        useDeferDoneCallback(cb, fieldName);
        return returnValue;
      }
    }
  });
}

export { createSuite };
