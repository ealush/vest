import {
  assign,
  asArray,
  CB,
  isArray,
  isFunction,
  isObject,
  withResolvers,
} from 'vest-utils';

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
  InferSchemaOutput,
  TSchema,
} from '../suiteResult/SuiteResultTypes';
import { useCreateSuiteResult } from '../suiteResult/suiteResult';

import { SuiteModifiers, SuiteCallbackWithSchema } from './SuiteTypes';

type SchemaRunResult = {
  message?: string;
  pass: boolean;
  path?: string[];
  type?: unknown;
};

/**
 * Creates the suite runner bound to a callback, modifiers and (optional) schema.
 *
 * The runner performs schema preprocessing once per run, stores the original input
 * and parsed output, and then executes the suite callback within SuiteContext.
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

    const schemaInput = args[0];
    const schemaRunResult = shouldRunSchema(schema, transformedModifiers)
      ? runSchemaWithParse(schema, schemaInput)
      : undefined;

    const callbackInput = getCallbackInput(schemaRunResult, schemaInput);
    const callbackArgs = [callbackInput, ...args.slice(1)] as Parameters<T>;

    return assign(
      promise,
      SuiteContext.run(
        {
          suiteParams: callbackArgs,
          schema,
          modifiers: transformedModifiers,
        },
        () => {
          useEmit('SUITE_RUN_STARTED');

          const useResolver = () => {
            const result = useCreateSuiteResult<F, G, S>(
              schema,
              callbackInput as InferSchemaOutput<S>,
              schemaInput,
            );

            if (!result.isPending()) {
              resolve(result);
            }

            return result;
          };

          return IsolateSuite(
            useRunSuiteCallback<F, T, S>({
              args: callbackArgs,
              modifiers: transformedModifiers,
              schema,
              schemaRunResult,
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

/**
 * Resolves the value that should be passed into the suite callback.
 */
function getCallbackInput(
  schemaRunResult: SchemaRunResult[] | undefined,
  fallback: unknown,
): unknown {
  if (
    !schemaRunResult ||
    schemaRunResult.length === 0 ||
    schemaRunResult.some(result => !result.pass)
  ) {
    return fallback;
  }

  const [firstResult] = schemaRunResult;
  return firstResult.type ?? fallback;
}

/**
 * Wraps suite callback execution and schema failure emission into an isolate callback.
 */
function useRunSuiteCallback<
  F extends TFieldName,
  T extends CB = CB,
  S extends TSchema = undefined,
>(params: {
  args: any[];
  modifiers: ReturnType<typeof useTransformedModifiers<F>>;
  schema: S | undefined;
  schemaRunResult?: SchemaRunResult[];
  suiteCallback: SuiteCallbackWithSchema<S, T>;
  useResolver: () => SuiteResult<F, any, S>;
}) {
  const {
    args,
    modifiers,
    schema,
    schemaRunResult,
    suiteCallback,
    useResolver,
  } = params;

  return () => {
    // Focused modifiers are applied before user callback so every test in this run
    // observes the same focus context.
    only(modifiers.only);
    skip(modifiers.skip);
    (suiteCallback as any)(...args);

    IsolateReorderable(
      runSchemaValidation(schema, modifiers, schemaRunResult),
      undefined,
      {
        tests: [],
      },
    );

    useEmit('SUITE_CALLBACK_RUN_FINISHED');
    return useResolver();
  };
}

/**
 * Normalizes user-provided modifiers into deterministic sets for O(1) membership checks.
 */
function useTransformedModifiers<F extends TFieldName>(
  modifiers: SuiteModifiers<F>,
) {
  return {
    ...modifiers,
    onlyGroup: new Set(modifiers.onlyGroup ? asArray(modifiers.onlyGroup) : []),
    skipGroup: new Set(modifiers.skipGroup ? asArray(modifiers.skipGroup) : []),
  };
}

/**
 * Emits schema failures into vest test tree.
 */
function runSchemaValidation<
  F extends TFieldName,
  S extends TSchema = undefined,
>(
  schema: S | undefined,
  modifiers: ReturnType<typeof useTransformedModifiers<F>>,
  schemaRunResult?: SchemaRunResult[],
) {
  // eslint-disable-next-line complexity
  return () => {
    if (!shouldRunSchema(schema, modifiers) || !schemaRunResult) {
      return;
    }

    for (const error of schemaRunResult) {
      if (error.pass) {
        continue;
      }

      const fieldName = error.path?.length ? error.path.join('.') : '__root__';

      test(
        fieldName,
        error.message ?? 'Validation failed',
        () => false,
        fieldName,
      );
    }
  };
}

/**
 * Runs schema parsing/validation in a safe order:
 * 1) try parse
 * 2) if parse succeeds, treat it as the authoritative validation output
 * 3) on expected parse validation failures, fallback to run(raw)
 */
// eslint-disable-next-line complexity
function runSchemaWithParse(schema: any, data: unknown): SchemaRunResult[] {
  if (isFunction(schema.parse)) {
    try {
      const parsedValue = schema.parse(data);

      if (shouldRunAfterParse(schema)) {
        return normalizeSchemaRunResult(schema.run(parsedValue), parsedValue);
      }

      return [
        {
          pass: true,
          type: parsedValue,
        },
      ];
    } catch (error) {
      if (!isExpectedSchemaParseError(error)) {
        throw error;
      }

      if (!isFunction(schema.run)) {
        return normalizeSchemaRunResult(
          {
            message:
              error instanceof Error ? error.message : 'Validation failed',
            pass: false,
          },
          data,
        );
      }
      // Expected validation failures can fallback to run(raw) for field-level path/message details.
    }
  }

  if (isFunction(schema.run)) {
    return normalizeSchemaRunResult(schema.run(data), data);
  }

  return [
    {
      pass: true,
      type: data,
    },
  ];
}

/**
 * Converts unknown schema.run return value into a stable internal representation.
 */
function normalizeSchemaRunResult(
  candidate: unknown,
  fallbackType: unknown,
): SchemaRunResult[] {
  if (isArray(candidate)) {
    return candidate.map(entry =>
      normalizeSingleSchemaRunResult(entry, fallbackType),
    );
  }

  return [normalizeSingleSchemaRunResult(candidate, fallbackType)];
}

/**
 * Converts a single unknown run payload into a safe result shape.
 */
function normalizeSingleSchemaRunResult(
  candidate: unknown,
  fallbackType: unknown,
): SchemaRunResult {
  if (!isSchemaRunResult(candidate)) {
    return {
      pass: false,
      type: fallbackType,
    };
  }

  return {
    message: candidate.message,
    pass: candidate.pass,
    path: candidate.path,
    type: candidate.type ?? fallbackType,
  };
}

/**
 * Runtime type guard for schema run payloads.
 */
function isSchemaRunResult(candidate: unknown): candidate is SchemaRunResult {
  if (!isObject(candidate)) {
    return false;
  }

  const value = candidate as Partial<SchemaRunResult>;

  const hasPass = typeof value.pass === 'boolean';
  const hasPath =
    value.path === undefined ||
    (isArray(value.path) && value.path.every(item => typeof item === 'string'));

  return hasPass && hasPath;
}

/**
 * Detects parse errors that represent expected validation failures.
 */
function isExpectedSchemaParseError(error: unknown): boolean {
  if (!isObject(error)) {
    return false;
  }

  const typedError = error as { isValidation?: unknown; name?: unknown };
  return (
    typedError.isValidation === true ||
    typedError.name === 'TypeError' ||
    error instanceof Error
  );
}

/**
 * Determines whether schema.run should execute after a successful parse call.
 *
 * For n4s StandardSchema-backed rules, parse already performs full validation.
 * Re-running run(parsed) can break coercion chains where post-parse types differ
 * from pre-parse input expectations.
 */
function shouldRunAfterParse(schema: any): boolean {
  if (!isFunction(schema.run)) {
    return false;
  }

  return schema?.['~standard']?.vendor !== 'n4s';
}

/**
 * Schema should run only when schema exists and the run is not field-focused.
 */
function shouldRunSchema(
  schema: unknown,
  modifiers: { only?: unknown },
): boolean {
  const hasOnly = isArray(modifiers.only)
    ? modifiers.only.length > 0
    : !!modifiers.only;

  return !hasOnly && !!schema;
}
