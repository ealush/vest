import { asArray, CB, assign } from 'vest-utils';
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
import { Suite } from 'SuiteTypes';
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

  // Assign methods to the suite
  // We do this within the VestRuntime so that the suite methods
  // will be bound to the suite's stateRef and be able to access it.
  // eslint-disable-next-line max-lines-per-function
  return VestRuntime.Run(stateRef, () => {
    const VestBus = useInitVestBus();
    return createSuiteInstance();

    function createSuiteInstance() {
      const persistedRun = VestRuntime.persist(createSuiteRunner());

      return {
        after: VestRuntime.persist(initCallback(after)),
        afterField: VestRuntime.persist(initCallback(afterField)),
        dump: VestRuntime.persist(VestRuntime.useAvailableRoot<TIsolateSuite>),
        get: VestRuntime.persist(useCreateSuiteResult<F, G>),
        remove: Bus.usePrepareEmitter<string>('REMOVE_FIELD'),
        reset: Bus.usePrepareEmitter('RESET_SUITE'),
        resetField: Bus.usePrepareEmitter<string>('RESET_FIELD'),
        resume: VestRuntime.persist(useLoadSuite),
        run: VestRuntime.persist(initCallback(persistedRun)),
        runStatic: VestRuntime.persist(createStaticRunner()),
        subscribe: VestBus.subscribe,
        ...bindSuiteSelectors<F, G>(VestRuntime.persist(useCreateSuiteResult)),
        ...getTypedMethods<F, G>(),
      };

      function after(cb: CB) {
        return addAfter(cb);
      }

      function afterField(fieldName: F, cb: CB) {
        return addAfter(cb, fieldName);
      }

      function addAfter(cb: CB, fieldName?: F) {
        const returnValue = {
          run: persistedRun,
          after: VestRuntime.persist(after),
          afterField: VestRuntime.persist(afterField),
        };

        useDeferDoneCallback(cb, fieldName);
        return returnValue;
      }

      function initCallback<U extends (...args: any[]) => any>(cb: U): U {
        return ((...args: Parameters<U>) => {
          Bus.useEmit('INITIALIZING_CALLBACKS');
          return cb(...args);
        }) as U;
      }
    }
  });

  function createStaticRunner() {
    return function runStatic(...runArgs: Parameters<T>) {
      const suite = createSuite<F, G, T>(suiteName, suiteCallback);
      return suite.run(...runArgs);
    };
  }

  function createSuiteRunner() {
    return function runSuite(...args: Parameters<T>): SuiteResult<F, G> {
      const { resolve, promise } = Promise.withResolvers<SuiteResult<F, G>>();
      return assign(
        promise,
        SuiteContext.run(
          {
            suiteParams: args,
          },
          () => {
            Bus.useEmit('SUITE_RUN_STARTED');

            function resolver() {
              const result = useCreateSuiteResult<F, G>();
              resolve(result);
              return result;
            }

            return IsolateSuite(() => {
              suiteCallback(...args);
              Bus.useEmit('SUITE_CALLBACK_RUN_FINISHED');
              return useCreateSuiteResult<F, G>();
            }, resolver);
          },
        ).output,
      );
    };
  }
}

export { createSuite };
