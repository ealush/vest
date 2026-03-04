import { enforce } from 'n4s';
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
  TSchema,
} from '../suiteResult/SuiteResultTypes';
import { useCreateSuiteResult } from '../suiteResult/suiteResult';

import { SuiteModifiers, SuiteCallbackWithSchema } from './SuiteTypes';

type SchemaRunResult = {
  readonly message?: string;
  readonly pass: boolean;
  readonly path?: readonly string[];
  readonly type?: unknown;
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
    const runTime = new Date();
    const { resolve, promise } = withResolvers<SuiteResult<F, G, S>>();

    const schemaInput = args[0];
    const schemaRunResult = shouldRunSchema(schema)
      ? runSchemaWithParse(schema, schemaInput, transformedModifiers)
      : undefined;

    const callbackInput = getCallbackInput(schemaRunResult, schemaInput);
    const callbackArgs = [callbackInput, ...args.slice(1)] as Parameters<T>;
    const runData = callbackInput;

    const suiteResult = SuiteContext.run(
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
            callbackInput,
            runData,
            runTime,
          );

          if (!result.isPending()) {
            resolve(result);
          }

          return result;
        };

        return IsolateSuite(
          useRunSuiteCallback<F, T, S, G>({
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
    );

    return bindSuiteResultMethods(promise, suiteResult, runData, runTime);
  };
}

/**
 * Resolves the value that should be passed into the suite callback.
 */
function getCallbackInput(
  schemaRunResult: SchemaRunResult[] | undefined,
  fallback: unknown,
): unknown {
  if (!schemaRunResult || schemaRunResult.some(result => !result.pass)) {
    return fallback;
  }

  const [firstResult] = schemaRunResult;
  return firstResult?.type ?? fallback;
}

/**
 * Wraps suite callback execution and schema failure emission into an isolate callback.
 */
function useRunSuiteCallback<
  F extends TFieldName,
  T extends CB = CB,
  S extends TSchema = undefined,
  G extends TGroupName = TGroupName,
  D = unknown,
>(params: {
  args: any[];
  modifiers: ReturnType<typeof useTransformedModifiers<F>>;
  schema: S | undefined;
  schemaRunResult?: SchemaRunResult[];
  suiteCallback: SuiteCallbackWithSchema<S, T>;
  useResolver: () => SuiteResult<F, G, S, D>;
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
    (suiteCallback as CB)(...args);

    IsolateReorderable(
      runSchemaValidation(schema, schemaRunResult),
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
function runSchemaValidation<S extends TSchema = undefined>(
  schema: S | undefined,
  schemaRunResult?: SchemaRunResult[],
) {
  // eslint-disable-next-line complexity
  return () => {
    if (!shouldRunSchema(schema) || !schemaRunResult) {
      return;
    }

    for (let i = 0; i < schemaRunResult.length; i++) {
      const error = schemaRunResult[i];
      if (error.pass) {
        continue;
      }

      const fieldName = error.path?.length ? error.path.join('.') : '__root__';

      test(
        fieldName,
        error.message ?? 'Validation failed',
        () => false,
        `${fieldName}_${i}`,
      );
    }
  };
}

/**
 * Attempts to parse the schema. Returns null if parse fails gracefully,
 * so the caller can fall back to schema.run.
 */
function tryParseSchema(
  executableSchema: any,
  data: unknown,
): SchemaRunResult[] | null {
  if (!isFunction(executableSchema.parse)) return null;

  try {
    const parsedValue = executableSchema.parse(data);

    return shouldRunAfterParse(executableSchema)
      ? normalizeSchemaRunResult(executableSchema.run(parsedValue), parsedValue)
      : [{ pass: true, type: parsedValue }];
  } catch (error) {
    if (isExpectedSchemaParseError(error)) return null;
    throw error;
  }
}

/**
 * Runs schema parsing/validation in a safe order:
 * 1) try parse
 * 2) if parse succeeds, treat it as the authoritative validation output
 * 3) on expected parse validation failures, fallback to run(raw)
 */
function runSchemaWithParse(
  schema: any,
  data: unknown,
  modifiers: { only?: unknown; skip?: unknown },
): SchemaRunResult[] {
  const executableSchema = applySchemaFocus(schema, modifiers);

  const parseResult = tryParseSchema(executableSchema, data);
  if (parseResult) {
    return parseResult;
  }

  if (isFunction(executableSchema.run)) {
    return normalizeSchemaRunResult(executableSchema.run(data), data);
  }

  return [
    {
      pass: true,
      type: data,
    },
  ];
}

const N4S_VENDOR = 'n4s';

function isN4sSchema(schema: any): boolean {
  return schema?.['~standard']?.vendor === N4S_VENDOR && !!schema?.__schema;
}

function applySchemaFocus(
  schema: any,
  modifiers: { only?: unknown; skip?: unknown },
): any {
  if (!isN4sSchema(schema)) {
    return schema;
  }

  const only = buildArrayProp(modifiers.only);
  const skip = buildArrayProp(modifiers.skip);

  return buildFocusedSchemaInstance(schema, only, skip);
}

function buildArrayProp(prop: unknown): string[] | null {
  if (!prop) return null;
  const arr = asArray(prop) as string[];
  return arr.length > 0 ? arr : null;
}

function buildIntersectedSchemaInstance(
  schema: any,
  only: string[],
  skip: string[],
): any {
  return enforce.pick(
    schema.__schema,
    only.filter(f => !skip.includes(f)),
  );
}

function buildFocusedSchemaInstance(
  schema: any,
  only: string[] | null,
  skip: string[] | null,
): any {
  if (only) {
    return skip
      ? buildIntersectedSchemaInstance(schema, only, skip)
      : enforce.pick(schema.__schema, only);
  }

  return skip ? enforce.omit(schema.__schema, skip) : schema;
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
  if (error instanceof TypeError) {
    return true;
  }

  if (!isObject(error)) {
    return false;
  }

  const typedError = error as { isValidation?: unknown; name?: unknown };
  return typedError.isValidation === true || typedError.name === 'TypeError';
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

  return schema?.['~standard']?.vendor !== N4S_VENDOR;
}

function shouldRunSchema(schema: unknown): boolean {
  return !!schema;
}

function bindSuiteResultMethods<
  F extends TFieldName,
  G extends TGroupName,
  S extends TSchema,
>(
  promise: Promise<SuiteResult<F, G, S>>,
  suiteResult: SuiteResult<F, G, S>,
  runData: unknown,
  runTime: Date,
): SuiteResult<F, G, S> {
  const result = assign(promise, suiteResult);

  Object.defineProperty(result, 'run', {
    configurable: true,
    enumerable: false,
    value: Object.freeze({
      data: runData,
      time: runTime,
    }),
    writable: true,
  });

  return result;
}
