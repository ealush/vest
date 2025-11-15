import type { RuleInstance } from 'n4s';
import { CB, assign, withResolvers } from 'vest-utils';
import { Bus, VestRuntime } from 'vestjs-runtime';

import { IsolateSuite, TIsolateSuite } from 'IsolateSuite';
import { useCreateVestState, useLoadSuite } from 'Runtime';
import { SuiteContext } from 'SuiteContext';
import { SuiteResult, TFieldName, TGroupName } from 'SuiteResultTypes';
import { InferSuiteData, Suite, SuiteModifiers } from 'SuiteTypes';
import { useInitVestBus } from 'VestBus';
import { VestReconciler } from 'VestReconciler';
import { useDeferDoneCallback } from 'deferDoneCallback';
import { only } from 'focused';
import { getTypedMethods } from 'getTypedMethods';
import { useCreateSuiteResult } from 'suiteResult';
import { bindSuiteSelectors } from 'suiteSelectors';
import { validateSuiteCallback } from 'validateSuiteParams';

function createSuite<
  F extends TFieldName,
  G extends TGroupName = string,
  T extends CB = CB,
>(suiteCallback: T): Suite<F, G, T>;
function createSuite<
  F extends TFieldName,
  S extends RuleInstance<any, any>,
  G extends TGroupName = string,
  Rest extends any[] = [],
  R = unknown,
>(
  suiteCallback: (data: InferSuiteData<S>, ...rest: Rest) => R,
  schema: S,
): Suite<F, G, (data: InferSuiteData<S>, ...rest: Rest) => R, S>;
// @vx-allow use-use
// eslint-disable-next-line max-lines-per-function
function createSuite<
  F extends TFieldName,
  T extends CB = CB,
  S extends RuleInstance<any, any> | undefined = undefined,
  G extends TGroupName = string,
>(suiteCallback: T, schema?: S): Suite<F, G, T, S> {
  validateSuiteCallback(suiteCallback);

  // Create a stateRef for the suite
  // It holds the suite's persisted values that may remain between runs.
  const stateRef = useCreateVestState({ suiteName: undefined, VestReconciler });

  // Assign methods to the suite
  // We do this within the VestRuntime so that the suite methods
  // will be bound to the suite's stateRef and be able to access it.
  return VestRuntime.Run(stateRef, () => {
    const VestBus = useInitVestBus();
    return createSuiteInstance();

    function createSuiteInstance(): Suite<F, G, T, S> {
      const modifiers: SuiteModifiers<F> = { only: undefined };

      const persistedRun = VestRuntime.persist(
        useCreateSuiteRunner<F, G, T, S>(suiteCallback, modifiers, schema),
      );

      const { after, afterField, focus } = useCreateSuiteMethods<F, G, T, S>(
        persistedRun,
        modifiers,
      );

      return {
        after: VestRuntime.persist(initCallback(after)),
        afterField: VestRuntime.persist(initCallback(afterField)),
        dump: VestRuntime.persist(VestRuntime.useAvailableRoot<TIsolateSuite>),
        focus: VestRuntime.persist(focus),
        get: VestRuntime.persist(() => useCreateSuiteResult<F, G, S>(schema)),
        remove: Bus.usePrepareEmitter<string>('REMOVE_FIELD'),
        reset: Bus.usePrepareEmitter('RESET_SUITE'),
        resetField: Bus.usePrepareEmitter<string>('RESET_FIELD'),
        resume: VestRuntime.persist(useLoadSuite),
        run: VestRuntime.persist(initCallback(persistedRun)),
        runStatic: VestRuntime.persist(createStaticRunner()),
        subscribe: VestBus.subscribe,
        ...bindSuiteSelectors<F, G, S>(
          VestRuntime.persist(() => useCreateSuiteResult<F, G, S>(schema)),
        ),
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
      const suite = createSuite<F, G, T, S>(suiteCallback, schema as S);
      return suite.run(...runArgs);
    };
  }
}

function useCreateSuiteMethods<
  F extends TFieldName,
  G extends TGroupName,
  T extends CB = CB,
  S extends RuleInstance<any, any> | undefined = undefined,
>(
  persistedRun: (...args: Parameters<T>) => SuiteResult<F, G, S>,
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
  S extends RuleInstance<any, any> | undefined = undefined,
>(suiteCallback: T, modifiers: SuiteModifiers<F>, schema?: S) {
  return function runSuite(...args: Parameters<T>): SuiteResult<F, G, S> {
    const { resolve, promise } = withResolvers<SuiteResult<F, G, S>>();
    return assign(
      promise,
      SuiteContext.run(
        {
          schema,
          suiteParams: args,
        },
        () => {
          Bus.useEmit('SUITE_RUN_STARTED');

          function resolver() {
            const result = useCreateSuiteResult<F, G, S>(schema);
            resolve(result);
            return result;
          }

          return IsolateSuite(() => {
            only(modifiers.only);
            // TODO: Implement automatic schema validation on suite.run()
            suiteCallback(...args);
            Bus.useEmit('SUITE_CALLBACK_RUN_FINISHED');
            return useCreateSuiteResult<F, G, S>(schema);
          }, resolver);
        },
      ).output,
    );
  };
}

export { createSuite };
