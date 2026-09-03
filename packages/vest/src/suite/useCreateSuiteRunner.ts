import { enforce } from 'n4s';
import {
  assign,
  asArray,
  CB,
  freezeAssign,
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
  InferSchemaOutput,
} from '../suiteResult/SuiteResultTypes';
import { useCreateSuiteResult } from '../suiteResult/suiteResult';

import { getAffectedFields } from './changed';
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
export function useCreateSuiteRunner<
  F extends TFieldName,
  G extends TGroupName,
  T extends CB = CB,
  S extends TSchema = undefined,
>(
  suiteCallback: SuiteCallbackWithSchema<S, T>,
  modifiers: SuiteModifiers<F, G>,
  schema?: S,
) {
  // Defer changed() expansion: if __changed is present, compute affected
  // using the actual run data (enables root->array fan-out).
  const hasChanged = !!(modifiers as any).__changed;
  // Note: we cannot compute affected here without data, so we do it inside runSuite below.
  const transformedModifiersBase = useTransformedModifiers<F, G>(modifiers);

  return function runSuite(
    ...args: S extends undefined
      ? Parameters<T>
      : [data: InferSchemaData<S>, ...args: any[]]
  ): SuiteResult<F, G, S> {
    const runTime = new Date();
    const { resolve, promise } = withResolvers<SuiteResult<F, G, S>>();

    const schemaInput = args[0];
    // If suite was created via changed(), expand affected fields using actual data
    let transformedModifiers: any = transformedModifiersBase;
    let changedAffected: string[] | null = null;
    if (hasChanged) {
      const rawChanged = (modifiers as any).__changed as string[];
      const affected = getAffectedFields(rawChanged, schema, schemaInput);
      const mergedOnly: any = (() => {
        const baseOnly = (modifiers as any).only;
        if (!baseOnly) return affected;
        const baseArr = Array.isArray(baseOnly) ? baseOnly : [baseOnly];
        return [...new Set([...(baseArr as string[]), ...affected])];
      })();
      const withAffected: any = { ...modifiers, only: mergedOnly };
      // Filter schema failures against the full focus set (base `only` +
      // affected), not just the affected fields, so combined only+changed
      // keeps base-only failures too.
      if (mergedOnly.length === 0) {
        // Explicit zero-field focus (e.g. changed([])): run no tests.
        // `only: []` alone is a runtime no-op (no focus isolate is created),
        // so skip-all carries the "run nothing" intent for suite tests. The
        // schema side resolves to an empty pick via buildArrayProp.
        withAffected.skip = true;
      }
      delete withAffected.__changed;
      transformedModifiers = useTransformedModifiers<F, G>(withAffected);
      changedAffected = mergedOnly;
    }

    const schemaRunResult = shouldRunSchema(schema)
      ? runSchemaWithParse(
          schema,
          schemaInput,
          transformedModifiers,
          changedAffected,
        )
      : undefined;

    const parsedDataChunk = getParsedDataChunk(schemaRunResult);

    const parsedData = (
      schema ? snapshotParsedData(parsedDataChunk) : undefined
    ) as Partial<InferSchemaOutput<S>> | undefined;

    const callbackInput = getCallbackInput(schemaRunResult, schemaInput);
    const callbackArgs = [callbackInput, ...args.slice(1)] as Parameters<T>;
    const runData = callbackInput;

    const suiteResult = SuiteContext.run(
      {
        suiteParams: callbackArgs,
        schema,
        modifiers: transformedModifiers as any,
      },
      () => {
        useEmit('SUITE_RUN_STARTED');

        const useResolver = () => {
          const result = useCreateSuiteResult<F, G, S>(
            schema,
            callbackInput,
            runData,
            runTime,
            parsedData,
            snapshotFocus(transformedModifiers),
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
 * Resolves the partial parsed data chunk from the schema run payload.
 */
function getParsedDataChunk(
  schemaRunResult: SchemaRunResult[] | undefined,
): unknown {
  if (!schemaRunResult || schemaRunResult.some(result => !result.pass)) {
    return {};
  }

  const [firstResult] = schemaRunResult;
  return firstResult?.type ?? {};
}

/**
 * Creates a defensive snapshot of the parsed data to prevent mutations
 * in the suite callback from affecting the result object.
 */
function snapshotParsedData(data: unknown): unknown {
  if (isArray(data)) {
    return Object.freeze([...(data as unknown[])]);
  }
  if (isObject(data)) {
    return freezeAssign({}, data as object);
  }
  return data;
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
  modifiers: ReturnType<typeof useTransformedModifiers<F, G>>;
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
function useTransformedModifiers<F extends TFieldName, G extends TGroupName>(
  modifiers: SuiteModifiers<F, G>,
) {
  return {
    ...modifiers,
    onlyGroup: new Set(modifiers.onlyGroup ? asArray(modifiers.onlyGroup) : []),
    skipGroup: new Set(modifiers.skipGroup ? asArray(modifiers.skipGroup) : []),
  };
}

/**
 * Normalizes internal focus Sets back into the external Array representation
 * and freezes the structure explicitly for immutability in the results.
 */
function snapshotFocus<F extends TFieldName, G extends TGroupName>(
  modifiers: ReturnType<typeof useTransformedModifiers<F, G>>,
): SuiteModifiers<F, G> {
  return freezeAssign<SuiteModifiers<F, G>>(
    {},
    snapshotField(modifiers, 'only'),
    snapshotField(modifiers, 'skip'),
    snapshotGroup(modifiers, 'onlyGroup'),
    snapshotGroup(modifiers, 'skipGroup'),
  );
}

function snapshotField<F extends TFieldName, G extends TGroupName>(
  modifiers: ReturnType<typeof useTransformedModifiers<F, G>>,
  key: 'only' | 'skip',
): Partial<SuiteModifiers<F, G>> {
  const original = modifiers[key];

  if (!original) {
    return {};
  }
  const value = asArray(original);
  return value.length > 0 ? { [key]: Object.freeze([...value]) } : {};
}

function snapshotGroup<F extends TFieldName, G extends TGroupName>(
  modifiers: ReturnType<typeof useTransformedModifiers<F, G>>,
  key: 'onlyGroup' | 'skipGroup',
): Partial<SuiteModifiers<F, G>> {
  const value = modifiers[key];
  return value.size > 0 ? { [key]: Object.freeze([...value]) } : {};
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
      const testKey = `${fieldName}_${i}`;
      test(fieldName, error.message, () => false, testKey);
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
  changedAffected?: string[] | null,
): SchemaRunResult[] {
  // changed() with nested affected paths cannot use enforce.pick (it selects
  // top-level keys only, silently dropping nested validation). Run the full
  // schema instead and narrow failures to the affected paths. Top-level-only
  // focus keeps the existing pick/omit behavior identical.
  const nestedAffected = getNestedChangedAffected(schema, changedAffected);
  const executableSchema = nestedAffected
    ? schema
    : applySchemaFocus(schema, modifiers);

  let result: SchemaRunResult[];
  const parseResult = tryParseSchema(executableSchema, data);
  if (parseResult) {
    result = parseResult;
  } else if (isFunction(executableSchema.run)) {
    result = normalizeSchemaRunResult(executableSchema.run(data), data);
  } else {
    result = [
      {
        pass: true,
        type: data,
      },
    ];
  }

  return nestedAffected
    ? filterSchemaResultsToAffected(result, nestedAffected, data)
    : result;
}

/**
 * Detects when a changed() affected set cannot be projected with a top-level
 * enforce.pick: any dotted/bracketed path (e.g. 'profile.state') would match
 * no top-level key. Returns the affected list when a full-schema run with
 * failure filtering is needed, null otherwise.
 */
function getNestedChangedAffected(
  schema: any,
  affected: string[] | null | undefined,
): string[] | null {
  if (!affected || !isN4sSchema(schema)) {
    return null;
  }
  const hasNested = affected.some(isNestedFieldName);
  return hasNested ? affected : null;
}

function isNestedFieldName(field: unknown): boolean {
  return typeof field === 'string' && /[.[]/.test(field);
}

/**
 * Narrows full-schema run results to failures under the affected changed paths.
 * Passing entries are preserved; root failures (no path) are kept since they
 * affect every field. A failure is kept on exact match or when either side is
 * a parent path of the other (affected 'profile' keeps failures at
 * 'profile.state', and a failure at 'profile' is relevant to 'profile.state').
 */
function filterSchemaResultsToAffected(
  results: SchemaRunResult[],
  affected: string[],
  data: unknown,
): SchemaRunResult[] {
  const affectedSet = new Set(affected.map(normalizeAffectedFieldName));
  const kept = results.filter(result =>
    isAffectedSchemaResult(result, affectedSet),
  );
  if (kept.length > 0) {
    return kept;
  }
  return [{ pass: true, type: results[0]?.type ?? data }];
}

function isAffectedSchemaResult(
  result: SchemaRunResult,
  affectedSet: Set<string>,
): boolean {
  if (result.pass) {
    return true;
  }
  const failureName = (result.path ?? []).map(String).join('.');
  return !failureName || isAffectedFailureName(failureName, affectedSet);
}

function isAffectedFailureName(
  failureName: string,
  affectedSet: Set<string>,
): boolean {
  for (const name of affectedSet) {
    if (
      failureName === name ||
      failureName.startsWith(`${name}.`) ||
      name.startsWith(`${failureName}.`)
    ) {
      return true;
    }
  }
  return false;
}

function normalizeAffectedFieldName(field: string): string {
  return field
    .replace(/\[/g, '.')
    .replace(/\]/g, '')
    .split('.')
    .filter(Boolean)
    .join('.');
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
  // An explicitly empty array is a zero-field focus (e.g. changed([])):
  // keep it so the schema resolves to an empty pick instead of no focus.
  return asArray(prop) as string[];
}

function buildIntersectedSchemaInstance(
  schema: any,
  only: string[],
  skip: string[],
): any {
  const skipSet = new Set(skip);
  return enforce.pick(
    schema.__schema,
    only.filter(f => !skipSet.has(f)),
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
      data: Object.freeze({
        raw: runData,
        parsed: suiteResult.run.data.parsed,
      }),
      focus: suiteResult.run.focus,
      time: runTime,
    }),
    writable: true,
  });

  return result;
}
