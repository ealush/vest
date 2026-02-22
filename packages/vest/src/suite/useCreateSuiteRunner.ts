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

type SchemaRunResult = {
  pass: boolean;
  type?: unknown;
  path?: string[];
  message?: string;
};

/**
 * Creates the actual suite runner function.
 * This function is responsible for initializing the suite context,
 * running the suite callback, and returning the result.
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
    const [inputData, ...restArgs] = args as [unknown, ...unknown[]];

    const schemaRunResult = getSchemaRunResult(schema, inputData);
    const parsedData = getParsedSchemaData<S>(
      schema,
      inputData,
      schemaRunResult,
    );
    const callbackArgs = [parsedData, ...restArgs] as Parameters<T>;

    return assign(
      promise,
      SuiteContext.run(
        {
          suiteParams: callbackArgs,
          schema,
          modifiers: {
            ...modifiers,
            skipGroupSet: modifiers.skipGroup
              ? new Set(asArray(modifiers.skipGroup))
              : undefined,
          },
        },
        () => {
          useEmit('SUITE_RUN_STARTED');

          function resolver() {
            const result = useCreateSuiteResult<F, G, S>(schema, parsedData);
            resolve(result);
            return result;
          }

          const output = IsolateSuite(() => {
            only(modifiers.only);
            skip(modifiers.skip);
            (suiteCallback as any)(...callbackArgs);

            IsolateReorderable(
              runSchemaValidation(
                schema,
                modifiers,
                inputData,
                schemaRunResult,
              ),
              undefined,
              {
                tests: [],
              },
            );
            useEmit('SUITE_CALLBACK_RUN_FINISHED');
            return useCreateSuiteResult<F, G, S>(schema, parsedData);
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
>(
  schema: S | undefined,
  modifiers: SuiteModifiers<F>,
  data: any,
  precomputedRunResult?: SchemaRunResult,
) {
  return () =>
    applySchemaValidation(schema, modifiers, data, precomputedRunResult);
}

// eslint-disable-next-line complexity
function applySchemaValidation(
  schema: any,
  modifiers: SuiteModifiers<any>,
  data: unknown,
  precomputedRunResult?: SchemaRunResult,
): void {
  if (shouldSkipSchemaValidation(schema, modifiers)) {
    return;
  }

  const runResult = precomputedRunResult ?? getSchemaRunResult(schema, data);

  if (!hasSchemaIssue(runResult)) {
    return;
  }

  const fieldName = runResult.path[0];
  if (!fieldName) return;

  test(
    fieldName,
    runResult.message ?? 'Validation failed',
    () => false,
    fieldName,
  );
}

function shouldSkipSchemaValidation(
  schema: any,
  modifiers: SuiteModifiers<any>,
): boolean {
  return !!modifiers.only || !schema || !isFunction(schema.run);
}

function hasSchemaIssue(
  runResult?: SchemaRunResult,
): runResult is Required<Pick<SchemaRunResult, 'path'>> & SchemaRunResult {
  return !!runResult && !runResult.pass && Array.isArray(runResult.path);
}

function getSchemaRunResult(
  schema: any,
  data: unknown,
): SchemaRunResult | undefined {
  if (!schema || !isFunction(schema.run)) {
    return undefined;
  }

  return schema.run(data) as SchemaRunResult;
}

/**
 * Prefer `schema.parse` for parsing semantics when available.
 * Fallback to `schema.run` transformed type.
 */
function getParsedSchemaData<S extends TSchema>(
  schema: S | undefined,
  data: unknown,
  schemaRunResult?: SchemaRunResult,
): InferSchemaData<S> {
  if (!schema) {
    return data as InferSchemaData<S>;
  }

  if (isFunction((schema as any).parse)) {
    return safeParseSchema<S>(schema, data);
  }

  return parseFromRunResult<S>(data, schemaRunResult);
}

function parseFromRunResult<S extends TSchema>(
  data: unknown,
  schemaRunResult?: SchemaRunResult,
): InferSchemaData<S> {
  if (!schemaRunResult || !schemaRunResult.pass) {
    return data as InferSchemaData<S>;
  }

  return schemaRunResult.type as InferSchemaData<S>;
}

function safeParseSchema<S extends TSchema>(
  schema: S,
  data: unknown,
): InferSchemaData<S> {
  try {
    return (schema as any).parse(data) as InferSchemaData<S>;
  } catch {
    return data as InferSchemaData<S>;
  }
}
