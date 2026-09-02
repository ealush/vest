import { CB, makeBrand, withCatch } from 'vest-utils';
import { VestRuntime } from 'vestjs-runtime';

import { useEmit, usePrepareEmitter, Subscribe } from '../core/VestBus/VestBus';

import { useLoadSuite } from '../core/Runtime';
import { TIsolateSuite } from '../core/isolate/IsolateSuite/IsolateSuite';
import {
  TFieldName,
  TGroupName,
  TSchema,
  InferSchemaData,
} from '../suiteResult/SuiteResultTypes';
import { bindSuiteSelectors } from '../suiteResult/selectors/suiteSelectors';
import { useCreateSuiteResult } from '../suiteResult/suiteResult';

import { FieldExclusion } from '../hooks/focused/focused';
import { SuiteModifiers, SuiteCallbackWithSchema } from './SuiteTypes';
import { useDeferDoneCallback } from './after/deferDoneCallback';
import { assertNoAbortSignal } from './changed';
import type { ChangedOptions } from './changed';
import { createSuite } from './createSuite';
import { getStandardSchema } from './getStandardSchema';
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
  S extends TSchema = undefined,
>(
  suiteCallback: SuiteCallbackWithSchema<S, T>,
  modifiers: SuiteModifiers<F, G>,
  subscribe: Subscribe,
  schema?: S,
) {
  const persistedRun = VestRuntime.persist(
    useCreateSuiteRunner<F, G, T, S>(suiteCallback, modifiers, schema),
  );
  const staticRunner = VestRuntime.persist(
    createStaticRunner<F, G, T, S>(suiteCallback, schema),
  );

  return useCreateSuiteMethodsHelper({
    modifiers,
    persistedRun,
    schema,
    staticRunner,
    subscribe,
    suiteCallback,
  });
}

function useCreateSuiteMethodsHelper<
  F extends TFieldName,
  G extends TGroupName,
  T extends CB = CB,
  S extends TSchema = undefined,
>(ctx: {
  suiteCallback: SuiteCallbackWithSchema<S, T>;
  modifiers: SuiteModifiers<F, G>;
  subscribe: Subscribe;
  schema?: S;
  persistedRun: any;
  staticRunner: any;
}): ReturnType<typeof useGetSuiteMethods<F, G, T, S>> & {
  '~standard': ReturnType<typeof getStandardSchema<S>>;
} {
  const suiteMethods = useGetSuiteMethods<F, G, T, S>(ctx);

  return {
    ...suiteMethods,
    '~standard': getStandardSchema<S>(ctx.staticRunner),
  };
}

function useGetSuiteMethods<
  F extends TFieldName,
  G extends TGroupName,
  T extends CB = CB,
  S extends TSchema = undefined,
>(ctx: {
  suiteCallback: SuiteCallbackWithSchema<S, T>;
  modifiers: SuiteModifiers<F, G>;
  subscribe: Subscribe;
  schema?: S;
  persistedRun: any;
  staticRunner: any;
}): any {
  const { suiteCallback, modifiers, subscribe, schema } = ctx;

  const get = VestRuntime.persist(() => useCreateSuiteResult<F, G, S>(schema));
  return {
    ...useGetLifecycleMethods(ctx),
    dump: VestRuntime.persist(VestRuntime.useAvailableRoot<TIsolateSuite>),
    get,
    ...bindSuiteSelectors<F, G, S>(get),
    ...getTypedMethods<F, G>(),
    // focus, only and changed must come after the spreads to prevent spread keys from overriding them
    focus: VestRuntime.persist(
      useCreateFocus<F, G, T, S>(suiteCallback, modifiers, subscribe, schema),
    ),
    only: VestRuntime.persist(
      useCreateOnly<F, G, T, S>(suiteCallback, modifiers, subscribe, schema),
    ),
    changed: VestRuntime.persist(
      useCreateChanged<F, G, T, S>(
        suiteCallback,
        modifiers,
        subscribe,
        schema,
      ),
    ),
  };
}

function useGetLifecycleMethods<
  F extends TFieldName,
  G extends TGroupName,
  T extends CB = CB,
  S extends TSchema = undefined,
>(ctx: {
  suiteCallback: SuiteCallbackWithSchema<S, T>;
  modifiers: SuiteModifiers<F, G>;
  subscribe: Subscribe;
  schema?: S;
  persistedRun: any;
  staticRunner: any;
}) {
  const { persistedRun, staticRunner, subscribe } = ctx;

  return {
    afterEach: VestRuntime.persist((cb: CB) =>
      useAddAfterHelper<F, G, T, S>(ctx, cb),
    ),
    afterField: VestRuntime.persist((fieldName: F | string, cb: CB) =>
      useAddAfterHelper<F, G, T, S>(
        ctx,
        cb,
        makeBrand<TFieldName>(fieldName) as F,
      ),
    ),
    remove: VestRuntime.persist((fieldName: F | string) =>
      useEmit('REMOVE_FIELD', makeBrand<TFieldName>(fieldName)),
    ),
    reset: VestRuntime.persist(usePrepareEmitter('RESET_SUITE')),
    resetField: VestRuntime.persist((fieldName: F | string) =>
      useEmit('RESET_FIELD', makeBrand<TFieldName>(fieldName)),
    ),
    resume: VestRuntime.persist(useLoadSuite),
    run: persistedRun,
    runStatic: staticRunner,
    subscribe,
    validate: createValidate<T, S>(staticRunner),
  };
}

function useAddAfterHelper<
  F extends TFieldName,
  G extends TGroupName,
  T extends CB = CB,
  S extends TSchema = undefined,
>(
  ctx: {
    suiteCallback: SuiteCallbackWithSchema<S, T>;
    modifiers: SuiteModifiers<F, G>;
    subscribe: Subscribe;
    schema?: S;
    persistedRun: any;
    staticRunner: any;
  },
  cb: CB,
  fieldName?: F,
): any {
  useDeferDoneCallback(withCatch(cb), fieldName);
  return useCreateSuiteMethodsHelper(ctx);
}

/**
 * Binds the lifecycle methods to the suite methods.
 * e.g. after, afterField, run...
 *
 * @param {Object} methods - The suite methods.
 * @returns {Object} - The suite methods with lifecycle methods bound.
 */
export function useBindSuiteLifecycle<
  F extends TFieldName,
  G extends TGroupName,
  T extends CB = CB,
  S extends TSchema = undefined,
>(
  methods: ReturnType<typeof useCreateSuiteMethods<F, G, T, S>>,
): ReturnType<typeof useCreateSuiteMethods<F, G, T, S>> {
  return {
    ...methods,
    afterEach: VestRuntime.persist(useInitCallback(methods.afterEach)),
    afterField: VestRuntime.persist(useInitCallback(methods.afterField)),
    run: VestRuntime.persist(useInitCallback(methods.run)),
  };
}

/**
 * Creates a focus function that can be used to create a focused suite.
 *
 * @param {Function} suiteCallback - The body of the suite.
 * @param {Object} modifiers - The modifiers for the suite (e.g., only).
 * @param {Function} subscribe - The subscribe function for the suite bus.
 * @param {Object} schema - The optional schema for the suite.
 * @returns {Function} - The focus function.
 */
function useCreateFocus<
  F extends TFieldName,
  G extends TGroupName,
  T extends CB = CB,
  S extends TSchema = undefined,
>(
  suiteCallback: SuiteCallbackWithSchema<S, T>,
  modifiers: SuiteModifiers<F, G>,
  subscribe: Subscribe,
  schema?: S,
) {
  return function focus(config: SuiteModifiers<F, G>) {
    return useCreateSuiteMethods<F, G, T, S>(
      suiteCallback,
      { ...modifiers, ...config },
      subscribe,
      schema,
    );
  };
}

/**
 * Creates an only function that can be used to create a focused suite on a specific field.
 * This is a shorthand for suite.focus({ only: 'fieldName' }).
 *
 * @param {Function} suiteCallback - The body of the suite.
 * @param {Object} modifiers - The modifiers for the suite (e.g., only).
 * @param {Function} subscribe - The subscribe function for the suite bus.
 * @param {Object} schema - The optional schema for the suite.
 * @returns {Function} - The only function.
 */
function useCreateOnly<
  F extends TFieldName,
  G extends TGroupName,
  T extends CB = CB,
  S extends TSchema = undefined,
>(
  suiteCallback: SuiteCallbackWithSchema<S, T>,
  modifiers: SuiteModifiers<F, G>,
  subscribe: Subscribe,
  schema?: S,
) {
  const focus = useCreateFocus<F, G, T, S>(
    suiteCallback,
    modifiers,
    subscribe,
    schema,
  );
  return function only(onlyField: NonNullable<SuiteModifiers<F, G>['only']>) {
    return focus({ only: onlyField });
  };
}

function useCreateChanged<
  F extends TFieldName,
  G extends TGroupName,
  T extends CB = CB,
  S extends TSchema = undefined,
>(
  suiteCallback: SuiteCallbackWithSchema<S, T>,
  modifiers: SuiteModifiers<F, G>,
  subscribe: Subscribe,
  schema?: S,
) {
  // Defer affected-set expansion until run(data) so root->array targets
  // can be expanded using the actual runtime data (rows.length).
  // Without deferral, changed('global') with target rows[$item].tax would
  // produce the unusable field 'rows.rows.$item.tax' and nothing would run.
  return function changed(
    changedField: string | string[] | FieldExclusion<F>,
    options?: ChangedOptions,
  ) {
    /** @deferred v2 — AbortSignal abort deferred */
    assertNoAbortSignal(options);
    const changedArray = Array.isArray(changedField)
      ? (changedField as string[])
      : [changedField as string];
    // Store raw changed fields; useCreateSuiteRunner will expand using run data
    // Fallback to immediate expansion for pre-run inspection (e.g., suite.get)
    // is handled by runner; here we just create a focused suite with deferred modifier.
    return useCreateSuiteMethods<F, G, T, S>(
      suiteCallback,
      { ...modifiers, __changed: changedArray } as SuiteModifiers<F, G>,
      subscribe,
      schema,
    );
  };
}

/**
 * Creates a static runner for the suite.
 *
 * @param {Function} suiteCallback - The body of the suite.
 * @param {Object} schema - The optional schema for the suite.
 * @returns {Function} - The static runner.
 */
function createStaticRunner<
  F extends TFieldName,
  G extends TGroupName,
  T extends CB = CB,
  S extends TSchema = undefined,
>(suiteCallback: SuiteCallbackWithSchema<S, T>, schema?: S) {
  return function runStatic(
    ...runArgs: S extends undefined
      ? Parameters<T>
      : [data: InferSchemaData<S>, ...args: any[]]
  ) {
    const suite = createSuite<F, G, T, S>(suiteCallback, schema);
    return suite.run(...(runArgs as Parameters<typeof suite.run>));
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
function useInitCallback<U extends (...args: any[]) => any>(cb: U): U {
  return ((...args: Parameters<U>) => {
    useEmit('INITIALIZING_CALLBACKS');
    return cb(...args);
  }) as U;
}

function createValidate<T extends CB = CB, S extends TSchema = undefined>(
  staticRunner: any,
) {
  return (
    ...args: S extends undefined
      ? [value: Parameters<T>[0]]
      : [data: InferSchemaData<S>, ...args: any[]]
  ) => (staticRunner as (...args: any[]) => any)(...args);
}
