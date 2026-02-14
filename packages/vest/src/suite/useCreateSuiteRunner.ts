import { assign, CB, isFunction, withResolvers } from 'vest-utils';

import { useEmit } from '../core/VestBus/VestBus';

import { SuiteContext } from '../core/context/SuiteContext';
import { IsolateReorderable } from 'vestjs-runtime';
import { IsolateSuite } from '../core/isolate/IsolateSuite/IsolateSuite';
import { test } from '../core/test/test';
import { only } from '../hooks/focused/focused';
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
        },
        () => {
          useEmit('SUITE_RUN_STARTED');

          function resolver() {
            const result = useCreateSuiteResult<F, G, S>(schema, args[0]);
            resolve(result);
            return result;
          }

          const output = IsolateSuite(() => {
            only(modifiers.only);
            (suiteCallback as any)(...(args as Parameters<T>));

            IsolateReorderable(
              runSchemaValidation(schema, modifiers, args[0]),
              undefined,
              {
                tests: [],
              },
            );
            useEmit('SUITE_CALLBACK_RUN_FINISHED');
            return useCreateSuiteResult<F, G, S>(schema, args[0]);
          }, resolver);
          return output;
        },
      ).output,
    );
  };
}

function runSchemaValidation<
  F extends TFieldName,
  S extends TSchema = undefined,
>(schema: S | undefined, modifiers: SuiteModifiers<F>, data: any) {
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

function shouldRunSchema(schema: any, modifiers: SuiteModifiers<any>): boolean {
  return !modifiers.only && !!schema && isFunction(schema.run);
}
