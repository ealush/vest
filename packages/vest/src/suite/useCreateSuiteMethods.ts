import { CB, withCatch } from 'vest-utils';
import { Bus, VestRuntime } from 'vestjs-runtime';

import { useLoadSuite } from '../core/Runtime';
import { Subscribe } from '../core/VestBus/VestBus';
import { TIsolateSuite } from '../core/isolate/IsolateSuite/IsolateSuite';
import { TFieldName, TGroupName } from '../suiteResult/SuiteResultTypes';
import { bindSuiteSelectors } from '../suiteResult/selectors/suiteSelectors';
import { useCreateSuiteResult } from '../suiteResult/suiteResult';

import { SuiteModifiers } from './SuiteTypes';
import { useDeferDoneCallback } from './after/deferDoneCallback';
import { createSuite } from './createSuite';
import { getTypedMethods } from './getTypedMethods';
import { useCreateSuiteRunner } from './useCreateSuiteRunner';


/**
 * Creates the methods available on the Suite object (e.g., run, get, reset).
 *
 * @param {Function} suiteCallback - The body of the suite.
 * @param {Object} modifiers - The modifiers for the suite (e.g., only).
 * @param {Function} subscribe - The subscribe function for the suite bus.
 * @returns {Object} - The suite methods.
 */
export function useCreateSuiteMethods<
  F extends TFieldName,
  G extends TGroupName,
  T extends CB = CB,
>(suiteCallback: T, modifiers: SuiteModifiers<F>, subscribe: Subscribe) {
  const persistedRun = VestRuntime.persist(
    useCreateSuiteRunner<F, G, T>(suiteCallback, modifiers),
  );

  return getPreRunMethods();

  function addAfter(cb: CB, fieldName?: F) {
    const returnValue = getPreRunMethods();

    useDeferDoneCallback(withCatch(cb), fieldName);
    return returnValue;
  }

  function getPreRunMethods() {
    return {
      after: VestRuntime.persist((cb: CB) => addAfter(cb)),
      afterField: VestRuntime.persist((fieldName: F, cb: CB) =>
        addAfter(cb, fieldName),
      ),
      dump: VestRuntime.persist(VestRuntime.useAvailableRoot<TIsolateSuite>),
      focus: VestRuntime.persist(
        useCreateFocus<F, G, T>(suiteCallback, modifiers, subscribe),
      ),
      get: VestRuntime.persist(useCreateSuiteResult<F, G>),
      remove: Bus.usePrepareEmitter<string>('REMOVE_FIELD'),
      reset: Bus.usePrepareEmitter('RESET_SUITE'),
      resetField: Bus.usePrepareEmitter<string>('RESET_FIELD'),
      resume: VestRuntime.persist(useLoadSuite),
      run: persistedRun,
      runStatic: VestRuntime.persist(createStaticRunner(suiteCallback)),
      subscribe,
      ...bindSuiteSelectors<F, G>(VestRuntime.persist(useCreateSuiteResult)),
      ...getTypedMethods<F, G>(),
    };
  }
}

/**
 * Binds the lifecycle methods to the suite methods.
 * e.g. after, afterField, run...
 *
 * @param {Object} methods - The suite methods.
 * @returns {Object} - The suite methods with lifecycle methods bound.
 */
export function bindSuiteLifecycle<
  F extends TFieldName,
  G extends TGroupName,
  T extends CB = CB,
>(
  methods: ReturnType<typeof useCreateSuiteMethods<F, G, T>>,
): ReturnType<typeof useCreateSuiteMethods<F, G, T>> {
  return {
    ...methods,
    after: VestRuntime.persist(initCallback(methods.after)),
    afterField: VestRuntime.persist(initCallback(methods.afterField)),
    run: VestRuntime.persist(initCallback(methods.run)),
  };
}

/**
 * Creates a focus function that can be used to create a focused suite.
 *
 * @param {Function} suiteCallback - The body of the suite.
 * @param {Object} modifiers - The modifiers for the suite (e.g., only).
 * @param {Function} subscribe - The subscribe function for the suite bus.
 * @returns {Function} - The focus function.
 */
function useCreateFocus<
  F extends TFieldName,
  G extends TGroupName,
  T extends CB = CB,
>(suiteCallback: T, modifiers: SuiteModifiers<F>, subscribe: Subscribe) {
  return function focus(config: SuiteModifiers<F>) {
    return useCreateSuiteMethods<F, G, T>(
      suiteCallback,
      { ...modifiers, ...config },
      subscribe,
    );
  };
}

/**
 * Creates a static runner for the suite.
 *
 * @param {Function} suiteCallback - The body of the suite.
 * @returns {Function} - The static runner.
 */
function createStaticRunner<
  F extends TFieldName,
  G extends TGroupName,
  T extends CB = CB,
>(suiteCallback: T) {
  return function runStatic(...runArgs: Parameters<T>) {
    const suite = createSuite<F, G, T>(suiteCallback);
    return suite.run(...runArgs);
  };
}

/**
 * Wraps a callback to emit the 'INITIALIZING_CALLBACKS' event before execution.
 * This is used to ensure that any previous callbacks are cleared or handled correctly
 * before the new one runs.
 *
 * @param {Function} cb - The callback to wrap.
 * @returns {Function} - The wrapped callback.
 */
function initCallback<U extends (...args: any[]) => any>(cb: U): U {
  return ((...args: Parameters<U>) => {
    Bus.useEmit('INITIALIZING_CALLBACKS');
    return cb(...args);
  }) as U;
}
