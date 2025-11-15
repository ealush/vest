/* eslint-disable max-lines-per-function */
import { CB, assign, withResolvers } from 'vest-utils';
import { Bus, VestRuntime } from 'vestjs-runtime';

import { getTypedMethods } from './getTypedMethods';

import { IsolateSuite, TIsolateSuite } from 'IsolateSuite';
import { useCreateVestState, useLoadSuite } from 'Runtime';
import { SuiteContext } from 'SuiteContext';
import { SuiteResult, TFieldName, TGroupName } from 'SuiteResultTypes';
import { Suite, SuiteModifiers } from 'SuiteTypes';
import { useInitVestBus } from 'VestBus';
import { VestReconciler } from 'VestReconciler';
import { useDeferDoneCallback } from 'deferDoneCallback';
import { only } from 'focused';
import { useCreateSuiteResult } from 'suiteResult';
import { bindSuiteSelectors } from 'suiteSelectors';
import { validateSuiteCallback } from 'validateSuiteParams';

// @vx-allow use-use
function createSuite<
  F extends TFieldName,
  G extends TGroupName,
  T extends CB = CB,
>(suiteCallback: T): Suite<F, G, T> {
  validateSuiteCallback(suiteCallback);

  // Create a stateRef for the suite
  // It holds the suite's persisted values that may remain between runs.
  const stateRef = useCreateVestState({ VestReconciler });

  // Assign methods to the suite
  // We do this within the VestRuntime so that the suite methods
  // will be bound to the suite's stateRef and be able to access it.
  return VestRuntime.Run(stateRef, () => {
    const VestBus = useInitVestBus();
    return createSuiteInstance();

    function createSuiteInstance(): Suite<F, G, T> {
      const modifiers: SuiteModifiers<F> = { only: undefined };

      const persistedRun = VestRuntime.persist(
        useCreateSuiteRunner<F, G, T>(suiteCallback, modifiers),
      );

      const { after, afterField, focus } = useCreateSuiteMethods<F, G, T>(
        persistedRun,
        modifiers,
      );

      return {
        after: VestRuntime.persist(initCallback(after)),
        afterField: VestRuntime.persist(initCallback(afterField)),
        dump: VestRuntime.persist(VestRuntime.useAvailableRoot<TIsolateSuite>),
        focus: VestRuntime.persist(focus),
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
      const suite = createSuite<F, G, T>(suiteCallback);
      return suite.run(...runArgs);
    };
  }
}

function useCreateSuiteMethods<
  F extends TFieldName,
  G extends TGroupName,
  T extends CB = CB,
>(
  persistedRun: (...args: Parameters<T>) => SuiteResult<F, G>,
  modifiers: SuiteModifiers<F>,
) {
  return getPreRunMethods();

  function after(cb: CB) {
    return addAfter(cb);
  }

  function afterField(fieldName: F, cb: CB) {
    return addAfter(cb, fieldName);
  }

  function focus(config: SuiteModifiers<F>) {
    modifiers.only = config.only;

    return getPreRunMethods();
  }

  function addAfter(cb: CB, fieldName?: F) {
    const returnValue = getPreRunMethods();

    useDeferDoneCallback(withCatch(cb), fieldName);
    return returnValue;
  }

  function getPreRunMethods() {
    return {
      after: VestRuntime.persist(after),
      afterField: VestRuntime.persist(afterField),
      focus,
      run: persistedRun,
    };
  }
}

function withCatch<T>(cb: CB<T>): () => T | unknown {
  return () => {
    try {
      cb();
    } catch (error) {
      return error;
    }
  };
}

function useCreateSuiteRunner<
  F extends TFieldName,
  G extends TGroupName,
  T extends CB = CB,
>(suiteCallback: CB, modifiers: SuiteModifiers<F>) {
  return function runSuite(...args: Parameters<T>): SuiteResult<F, G> {
    const { resolve, promise } = withResolvers<SuiteResult<F, G>>();
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
            only(modifiers.only);
            suiteCallback(...args);
            Bus.useEmit('SUITE_CALLBACK_RUN_FINISHED');
            return useCreateSuiteResult<F, G>();
          }, resolver);
        },
      ).output,
    );
  };
}

export { createSuite };
