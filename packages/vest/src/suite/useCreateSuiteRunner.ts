import { assign, asArray, CB, isFunction, withResolvers } from 'vest-utils';

import { useEmit } from '../core/VestBus/VestBus';

import { SuiteContext } from '../core/context/SuiteContext';
import { IsolateReorderable } from 'vestjs-runtime';
import { IsolateSuite } from '../core/isolate/IsolateSuite/IsolateSuite';
import { test } from '../core/test/test';
import { only, skip } from '../hooks/focused/focused';
import {
  SuiteResult,
  TFieldName,
  TGroupName,
  InferSchemaData,
  TSchema,
} from '../suiteResult/SuiteResultTypes';
import { useCreateSuiteResult } from '../suiteResult/suiteResult';

import { SuiteModifiers, SuiteCallbackWithSchema } from './SuiteTypes';

/**
 * Creates the actual suite runner function.
 * This function is responsible for initializing the suite context,
 * running the suite callback, and returning the result.
 *
 * @param {Function} suiteCallback - The body of the suite.
 * @param {Object} modifiers - The modifiers for the suite (e.g., only).
 * @returns {Function} - The suite runner function.
 */

// eslint-disable-next-line max-lines-per-function
export function useCreateSuiteRunner<
  F extends TFieldName,
  G extends TGroupName,
  T extends CB = CB,
  S extends TSchema = undefined,
>(
  suiteCallback: SuiteCallbackWithSchema<S, T>,
  modifiers: SuiteModifiers<F>,
  schema?: S,
) {
  const transformedModifiers = useTransformedModifiers(modifiers);
  return function runSuite(
    ...args: S extends undefined
      ? Parameters<T>
      : [data: InferSchemaData<S>, ...args: any[]]
  ): SuiteResult<F, G, S> {
    const { resolve, promise } = withResolvers<SuiteResult<F, G, S>>();
    return assign(
      promise,
      SuiteContext.run(
        {
          suiteParams: args as Parameters<T>,
          schema,
          modifiers: transformedModifiers,
        },
        () => {
          useEmit('SUITE_RUN_STARTED');
          const useResolver = () => {
            const result = useCreateSuiteResult<F, G, S>(schema, args[0]);
            if (!result.isPending()) {
              resolve(result);
            }
            return result;
          };
          return IsolateSuite(
            useRunSuiteCallback<F, T, S>({
              args,
              modifiers: transformedModifiers,
              schema,
              suiteCallback,
              useResolver,
            }),
            useResolver,
          ).output;
        },
      ),
    );
  };
}

function useRunSuiteCallback<
  F extends TFieldName,
  T extends CB = CB,
  S extends TSchema = undefined,
>(params: {
  args: any[];
  modifiers: ReturnType<typeof useTransformedModifiers<F>>;
  schema: S | undefined;
  suiteCallback: SuiteCallbackWithSchema<S, T>;
  useResolver: () => SuiteResult<F, any, S>;
}) {
  const { args, modifiers, schema, suiteCallback, useResolver } = params;
  return () => {
    // Apply field-level focus modifiers. These create transient Focused
    // isolates at the suite root that affect all tests in the suite.
    // `only` restricts the run to matching fields; `skip` excludes them.
    // `skipGroup` is handled separately inside `group()` — when a group
    // with a matching name is entered, it injects `skip(true)` into
    // the group's callback via the modifiers stored in SuiteContext.
    only(modifiers.only);
    skip(modifiers.skip);
    (suiteCallback as any)(...args);

    IsolateReorderable(
      runSchemaValidation(schema, modifiers, args[0]),
      undefined,
      {
        tests: [],
      },
    );
    useEmit('SUITE_CALLBACK_RUN_FINISHED');
    return useResolver();
  };
}

function useTransformedModifiers<F extends TFieldName>(
  modifiers: SuiteModifiers<F>,
) {
  return {
    ...modifiers,
    onlyGroup: new Set(modifiers.onlyGroup ? asArray(modifiers.onlyGroup) : []),
    skipGroup: new Set(modifiers.skipGroup ? asArray(modifiers.skipGroup) : []),
  };
}

function runSchemaValidation<
  F extends TFieldName,
  S extends TSchema = undefined,
>(
  schema: S | undefined,
  modifiers: ReturnType<typeof useTransformedModifiers<F>>,
  data: any,
) {
  return () => {
    if (!shouldRunSchema(schema, modifiers)) return;

    const runResult = (schema as any).run(data);

    if (!runResult.pass && runResult.path) {
      // Use the top-level field name (first segment) for error reporting
      const fieldName = runResult.path[0];
      test(fieldName, runResult.message, () => false, fieldName);
    }
  };
}

function shouldRunSchema(schema: any, modifiers: any): boolean {
  return !modifiers.only && !!schema && isFunction(schema.run);
}
