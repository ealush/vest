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
import { IsolateReorderable, VestRuntime } from 'vestjs-runtime';
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

import {
  SuiteModifiers,
  SuiteRuntimeModifiers,
  SuiteCallbackWithSchema,
} from './SuiteTypes';
import { planChanged, type ChangedPlan } from './changedHandler';
import {
  RetainedSchemaFailure,
  ROOT_SCHEMA_FIELD,
  schemaFocusOf,
  useRetainedSchemaFailures,
} from './retainedSchemaFailures';

export type SchemaRunResult = {
  readonly message?: string;
  readonly pass: boolean;
  readonly path?: readonly string[];
  readonly type?: unknown;
};

/**
 * Pending runs per suite, keyed by (suite callback, suite state).
 *
 * Every focus/only chain of a suite shares its callback, and the state
 * object keeps separate suites apart. Neither key works alone: one callback
 * can back several suites (and every runStatic call), while a persisted
 * wrapper can reuse a state object.
 *
 * When a newer run of the same suite starts while older runs are still
 * pending, each older run's promise adopts the newer run's promise. Awaiting
 * a superseded handle therefore settles with the latest outcome instead of
 * hanging when the reconciler cancels the older run's pending tests.
 */
const pendingRuns = new WeakMap<CB, WeakMap<object, unknown>>();

function pendingRunsFor(suiteCallback: CB): WeakMap<object, unknown> {
  const existing = pendingRuns.get(suiteCallback);
  if (existing !== undefined) return existing;
  const created = new WeakMap<object, unknown>();
  pendingRuns.set(suiteCallback, created);
  return created;
}

/**
 * Registers this run as the latest pending run of its suite and hands every
 * older pending run the latest promise. Returns a cleanup that unregisters
 * this run once it settles.
 */
function chainSupersededRuns<
  F extends TFieldName,
  G extends TGroupName,
  S extends TSchema,
>(
  suiteCallback: CB,
  state: object,
  latest: Promise<SuiteResult<F, G, S>>,
  ownResolve: (
    value: SuiteResult<F, G, S> | PromiseLike<SuiteResult<F, G, S>>,
  ) => void,
): () => void {
  const byState = pendingRunsFor(suiteCallback);
  const previous = byState.get(state);
  // Only the latest resolver is needed: older promises already adopt it.
  byState.set(state, ownResolve);
  if (previous !== undefined) {
    // A callback/state pair belongs to this runner's suite result type.
    (previous as (value: Promise<SuiteResult<F, G, S>>) => void)(latest);
  }
  return () => {
    if (byState.get(state) === ownResolve) {
      byState.delete(state);
    }
  };
}

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
  modifiers: SuiteRuntimeModifiers<F, G>,
  schema?: S,
) {
  const transformedModifiers = useTransformedModifiers<F, G>(modifiers);

  return function runSuite(
    ...args: S extends undefined
      ? Parameters<T>
      : [data: InferSchemaData<S>, ...args: any[]]
  ): SuiteResult<F, G, S> {
    const runTime = new Date();
    const { resolve: rawResolve, promise } =
      withResolvers<SuiteResult<F, G, S>>();
    const suiteState = VestRuntime.useXAppData();

    // Registration waits until synchronous setup succeeds: if the callback
    // throws, an older pending run must stay owned by itself rather than
    // adopt a promise that will never settle.
    let forgetPendingRun = (): void => {};
    const resolve = (
      result: SuiteResult<F, G, S> | PromiseLike<SuiteResult<F, G, S>>,
    ): void => {
      forgetPendingRun();
      rawResolve(result);
    };

    const schemaInput = args[0];
    const { focus, runModifiers, schemaRunResult, evaluated, value } =
      prepareRun(schema, schemaInput, transformedModifiers);

    const parsedDataChunk = value ?? getParsedDataChunk(schemaRunResult);

    const parsedData = (
      schema ? snapshotParsedData(parsedDataChunk) : undefined
    ) as Partial<InferSchemaOutput<S>> | undefined;

    // Schema failures outside this run's focus keep their previous verdict,
    // like user tests that focus leaves out. Read before the new root exists.
    const retainedSchemaFailures = shouldRunSchema(schema)
      ? useRetainedSchemaFailures(evaluated)
      : [];
    const schemaPassed = isCompleteSchemaPass(evaluated, schemaRunResult);

    const callbackInput = getCallbackInput(schemaRunResult, schemaInput);
    const callbackArgs = [callbackInput, ...args.slice(1)] as Parameters<T>;
    const runData = callbackInput;

    const suiteResult = SuiteContext.run(
      {
        suiteParams: callbackArgs,
        schema,
        modifiers: runModifiers,
      },
      () => {
        useEmit('SUITE_RUN_STARTED');

        const useResolver = () => {
          const result = useCreateSuiteResult<F, G, S>(
            schema,
            value === undefined ? callbackInput : parsedData,
            runData,
            runTime,
            parsedData,
            snapshotFocus(focus ?? runModifiers),
          );

          if (!result.isPending()) {
            resolve(result);
          }

          return result;
        };

        return IsolateSuite(
          useRunSuiteCallback<F, T, S, G>({
            args: callbackArgs,
            modifiers: runModifiers,
            retainedSchemaFailures,
            schema,
            schemaPassed,
            schemaRunResult,
            suiteCallback,
            useResolver,
          }),
          useResolver,
        ).output;
      },
    );

    const boundResult = bindSuiteResultMethods(
      promise,
      suiteResult,
      runData,
      runTime,
    );
    forgetPendingRun = chainSupersededRuns(
      suiteCallback,
      suiteState,
      promise,
      rawResolve,
    );
    if (!suiteResult.isPending()) forgetPendingRun();
    return boundResult;
  };
}

function prepareRun<
  F extends TFieldName,
  G extends TGroupName,
  S extends TSchema,
>(
  schema: S | undefined,
  data: unknown,
  modifiers: ReturnType<typeof useTransformedModifiers<F, G>>,
): {
  /** The modifiers reported as the run's focus, when not runModifiers. */
  focus?: typeof modifiers;
  runModifiers: typeof modifiers;
  schemaRunResult?: SchemaRunResult[];
  evaluated: ChangedPlan['evaluated'];
  value?: unknown;
} {
  if (modifiers.changed === undefined) {
    return {
      runModifiers: modifiers,
      schemaRunResult: shouldRunSchema(schema)
        ? runSchemaWithParse(schema, data, modifiers)
        : undefined,
      evaluated: schemaFocusOf(modifiers, isN4sSchema(schema)),
    };
  }
  const plan = planChanged(schema, modifiers.changed, data, modifiers);
  return {
    focus: { ...modifiers, only: plan.focus as F[] },
    runModifiers: {
      ...modifiers,
      only: plan.only as F[],
      schemaFocus: plan.schemaFocus,
    },
    schemaRunResult: plan.schemaResults,
    evaluated: plan.evaluated,
    value: plan.value,
  };
}

/**
 * Only a schema run that covered every field can make a test-free suite valid.
 */
function isCompleteSchemaPass(
  evaluated: ChangedPlan['evaluated'],
  schemaRunResult: SchemaRunResult[] | undefined,
): boolean {
  return evaluated === null && !!schemaRunResult?.every(result => result.pass);
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
  schemaPassed: boolean;
  schemaRunResult?: SchemaRunResult[];
  retainedSchemaFailures: RetainedSchemaFailure[];
  suiteCallback: SuiteCallbackWithSchema<S, T>;
  useResolver: () => SuiteResult<F, G, S, D>;
}) {
  const {
    args,
    modifiers,
    retainedSchemaFailures,
    schema,
    schemaPassed,
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
      runSchemaValidation(
        schema,
        schemaRunResult,
        retainedSchemaFailures,
        modifiers.schemaFocus,
      ),
      undefined,
      {
        // Kept in the tree so rebuilt results still see a complete schema pass.
        ...(schema ? { schemaPassed, schemaValidation: true } : {}),
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
  modifiers: SuiteRuntimeModifiers<F, G>,
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
  retainedSchemaFailures: RetainedSchemaFailure[] = [],
  schemaFocus?: string[],
) {
  // eslint-disable-next-line complexity
  return () => {
    if (!shouldRunSchema(schema) || !schemaRunResult) {
      return;
    }

    // Reports schema failures outside the run's focus without running
    // the user tests that share their field names.
    only(schemaFocus);

    for (let i = 0; i < schemaRunResult.length; i++) {
      const error = schemaRunResult[i];
      if (error.pass) {
        continue;
      }

      emitSchemaFailure(error, JSON.stringify([error.path, i]));
    }

    // Retained tests keep both identity and source path, including when
    // focus causes the reconciler to create a replacement test.
    for (const failure of retainedSchemaFailures) {
      emitSchemaFailure(failure, failure.key);
    }
  };
}

function emitSchemaFailure(
  { path, message }: { path?: readonly string[]; message?: string },
  key: string,
) {
  const fieldName = path?.length ? path.join('.') : ROOT_SCHEMA_FIELD;
  const schemaTest = test(fieldName, message, () => false, key);
  (schemaTest.data as { schemaPath?: readonly string[] }).schemaPath = path;
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
export function runSchemaWithParse(
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
