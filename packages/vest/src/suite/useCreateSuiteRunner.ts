import {
  mapWithoutValidation,
  parseAffectedFieldName,
  runSchemaPaths,
} from 'n4s/exports/internal';
import type { SelectiveSchemaResult } from 'n4s/exports/internal';
import {
  assign,
  asArray,
  CB,
  freezeAssign,
  hasOwnProperty,
  isArray,
  isObject,
  isUnsafeKey,
  withResolvers,
} from 'vest-utils';

import { useEmit } from '../core/VestBus/VestBus';

import { SuiteContext } from '../core/context/SuiteContext';
import { IsolateReorderable, VestRuntime } from 'vestjs-runtime';
import { IsolateSuite } from '../core/isolate/IsolateSuite/IsolateSuite';
import type {
  MappedSchemaOutput,
  TIsolateSuite,
} from '../core/isolate/IsolateSuite/IsolateSuite';
import { test } from '../core/test/test';
import { only, skip } from '../hooks/focused/focused';
import {
  SuiteResult,
  TFieldName,
  TGroupName,
  TSchema,
  InferSchemaOutput,
} from '../suiteResult/SuiteResultTypes';
import { useCreateSuiteResult } from '../suiteResult/suiteResult';

import { getAffectedFields } from './changed';
import type { FieldExclusion } from '../hooks/focused/focused';
import {
  InternalSuiteModifiers,
  SuiteModifiers,
  SuiteCallbackWithSchema,
  SuiteRunArguments,
} from './SuiteTypes';
import { cloneDataTree } from './cloneDataTree';
import {
  schemaFailureField,
  schemaFailureKey,
  useRetainedSchemaFailures,
} from './schemaValidation';

/**
 * Schema run outcome. Deliberately aliased to the n4s-owned
 * `SelectiveSchemaResult` (canonically defined in n4s
 * `./schema/selectiveRun`), never redefined: the selective engine lives in
 * n4s (see `runSchemaPaths`), and this name stays for suite-level
 * consumers so a schema failure means the same shape on both sides of the
 * boundary.
 */
export type SchemaRunResult = SelectiveSchemaResult;

/**
 * Pending runs per suite, keyed by (suite callback, suite state identity).
 * The callback is threaded unchanged through every focus/only/changed
 * chain of a suite, so all of a suite's runners share it; the state
 * identity (see `useCreateVestState`) keeps suites apart. Either dimension
 * alone misattributes: state identity can be reused by persisted wrappers,
 * while the callback alone aliases suites built from one shared callback and
 * runStatic calls. The composite key is correct in all three cases.
 *
 * Ownership-chaining guarantee: when a newer run of the same suite starts
 * while older runs are still pending, each older run's promise adopts the
 * newer run's promise, so every awaited handle settles with the latest
 * outcome — a stale handle can never observe a stale result, and no
 * superseded run hangs. Chaining is transitive (a run superseded twice
 * follows the chain to the latest run) and promise plumbing only: it reads
 * no SuiteContext and builds no snapshot, so settling cannot misattribute
 * state. A run with no successor settles on its own completion (normal
 * path). Stale async results themselves are already neutralized by the
 * test reconciler, which cancels the overridden pending test.
 */
const pendingRuns = new WeakMap<CB, WeakMap<object, Set<unknown>>>();

function pendingRunsFor(suiteCallback: CB): WeakMap<object, Set<unknown>> {
  const existing = pendingRuns.get(suiteCallback);
  if (existing !== undefined) {
    return existing;
  }
  const created = new WeakMap<object, Set<unknown>>();
  pendingRuns.set(suiteCallback, created);
  return created;
}

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
  const current = new Set<unknown>([ownResolve]);
  byState.set(state, current);
  if (previous !== undefined) {
    for (const resolvePrev of previous) {
      // Sound: every resolver in one (callback, state) bucket was
      // registered by this same runner, so all share F, G and S.
      (resolvePrev as (value: Promise<SuiteResult<F, G, S>>) => void)(latest);
    }
  }
  return () => {
    current.delete(ownResolve);
    if (current.size === 0 && byState.get(state) === current) {
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
export function useCreateSuiteRunner<
  F extends TFieldName,
  G extends TGroupName,
  T extends CB = CB,
  S extends TSchema = undefined,
>(
  suiteCallback: SuiteCallbackWithSchema<S, T>,
  modifiers: InternalSuiteModifiers<F, G>,
  schema?: S,
) {
  // Defer changed() expansion: if __changed is present, compute affected
  // using the actual run data (enables root->array fan-out).
  const changedFields = modifiers.__changed;
  // Note: we cannot compute affected here without data, so we do it inside runSuite below.
  const transformedModifiersBase = useTransformedModifiers<F, G>(modifiers);

  // eslint-disable-next-line complexity -- orchestration branches mirror suite modifiers
  return function runSuite(
    ...args: SuiteRunArguments<S, T>
  ): SuiteResult<F, G, S> {
    const runTime = new Date();
    const { resolve: rawResolve, promise } =
      withResolvers<SuiteResult<F, G, S>>();
    const suiteState = VestRuntime.useXAppData();

    // Ownership: a newer run of the same suite supersedes older
    // still-pending runs (plain or changed()). Superseded runs adopt the
    // successor's promise when it starts, so awaiting a stale run settles
    // with the latest outcome instead of hanging forever. First settlement
    // wins over any later completion of the stale run.
    // Registration is deliberately deferred until all synchronous schema and
    // suite setup has completed. If setup throws, an older pending run must
    // remain owned by itself instead of adopting an unreachable promise.
    let forgetPendingRun = (): void => {};
    const resolve = (
      result: SuiteResult<F, G, S> | PromiseLike<SuiteResult<F, G, S>>,
    ): void => {
      forgetPendingRun();
      rawResolve(result);
    };

    const schemaInput = args[0];
    // If suite was created via changed(), resolve test-selection focus
    // using the actual run data (enables root->array fan-out). Suite-test
    // focus needs the expanded affected set so dependents' user tests
    // execute. The exact same resolved set is passed to n4s below.
    let transformedModifiers = transformedModifiersBase;
    let changedAffected: string[] | null = null;
    let mappedAffected = mappedFocusPaths<F, G>(transformedModifiersBase);
    if (changedFields) {
      const focus = useChangedRunFocus<F, G>(
        changedFields,
        modifiers,
        schema,
        schemaInput,
      );
      transformedModifiers = focus.transformedModifiers;
      changedAffected = focus.changedAffected;
      mappedAffected = focus.mappedAffected;
    }

    // Dependency-aware schema execution is owned by n4s. Vest resolves the
    // plan once through n4s, then gives that exact set to both suite focus
    // and schema execution so direct dependencies never fan out twice.
    const schemaRunResult = shouldRunSchema(schema)
      ? runSchemaPaths(schema, schemaInput, {
          resolvedAffected: changedAffected,
          only: transformedModifiers.only,
          skip: transformedModifiers.__skipAll || transformedModifiers.skip,
        })
      : undefined;

    const parsedDataChunk = getParsedDataChunk(schemaRunResult);
    const retainedSchemaFailures = useRetainedSchemaFailures(changedAffected);

    const parsedData = (
      schema ? snapshotParsedData(parsedDataChunk) : undefined
    ) as Partial<InferSchemaOutput<S>> | undefined;

    const callbackMapping = getCallbackMapping({
      affected: mappedAffected,
      fallback: schemaInput,
      previous: usePreviousMappedSchemaOutput(),
      schema,
      schemaRunResult,
      skipped: skippedFocusPaths(transformedModifiers.skip),
    });
    const callbackInput = callbackMapping.input;
    const callbackArgs = [callbackInput, ...args.slice(1)] as Parameters<T>;
    const runData =
      schema && schemaRunResult?.every(result => result.pass)
        ? parsedDataChunk
        : schemaInput;
    // Schema-mapped callback data, public output, and the retained cache must
    // never share mutable containers. Preserve the established raw-input
    // identity for schema failures and schema-less suites.
    const resultOutput = schema ? cloneDataTree(callbackInput) : callbackInput;
    const runDataSnapshot =
      schema && schemaRunResult?.every(result => result.pass)
        ? cloneDataTree(runData)
        : runData;

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
            resultOutput,
            runDataSnapshot,
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
            retainedSchemaFailures,
            schema,
            schemaRunResult,
            suiteCallback,
            useResolver,
          }),
          useResolver,
          callbackMapping.retained,
        ).output;
      },
    );

    const boundResult = bindSuiteResultMethods(
      promise,
      suiteResult,
      runDataSnapshot,
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

/**
 * Resolves changed() run focus from the raw changed names and run data:
 * the expanded affected set drives suite-test selection (dependents' user
 * tests must execute), while the schema input stays raw — the unexpanded
 * changed names plus base `only` names (so combined only+changed still
 * validates the base fields). n4s resolves the changed names here and the
 * resulting plan is reused by both execution layers; expanding it again
 * would compose transitively and break the pinned non-transitive changed()
 * contract.
 */
function useChangedRunFocus<F extends TFieldName, G extends TGroupName>(
  changedFields: string[],
  modifiers: InternalSuiteModifiers<F, G>,
  schema: unknown,
  schemaInput: unknown,
): {
  transformedModifiers: ReturnType<typeof useTransformedModifiers<F, G>>;
  changedAffected: string[];
  mappedAffected: string[];
} {
  const affected = getAffectedFields(changedFields, schema, schemaInput);
  const baseOnly = modifiers.only;
  const baseList = baseOnlyListOf(baseOnly);
  const mergedOnly: string[] = baseOnly
    ? [...new Set([...baseList, ...affected])]
    : affected;
  // mergedOnly carries dynamic dotted names (e.g. 'profile.state')
  // that escape the suite's static field vocabulary F by design —
  // changed() affected paths are runtime data, like hasErrors() names.
  const withAffected: InternalSuiteModifiers<F, G> = {
    ...modifiers,
    only: mergedOnly as FieldExclusion<F>,
  };
  // Filter schema failures against the full focus set (base `only` +
  // affected), not just the affected fields, so combined only+changed
  // keeps base-only failures too.
  if (mergedOnly.length === 0) {
    // Explicit zero-field focus (e.g. changed([])): run no tests.
    // `only: []` alone is a runtime no-op (no focus isolate is created),
    // so skip-all carries the "run nothing" intent for suite tests. The
    // schema side resolves to an empty affected set (runs nothing).
    // Note this branch only fires when no base `only` exists either:
    // an explicit only('a') combined with changed([]) intentionally
    // still runs 'a'.
    withAffected.__skipAll = true;
  }
  delete withAffected.__changed;
  return {
    transformedModifiers: useTransformedModifiers<F, G>(withAffected),
    changedAffected: mergedOnly,
    mappedAffected: mappedFocusPaths(withAffected) ?? [],
  };
}

// Non-string entries (e.g. a runtime boolean) never reach field-name
// normalization, which would throw on them — same guard as skip-all.
function baseOnlyListOf<F extends TFieldName, G extends TGroupName>(
  only: InternalSuiteModifiers<F, G>['only'],
): string[] {
  if (!only) return [];
  return asArray(only).filter(entry => typeof entry === 'string');
}

// String entries of the `skip` modifier for callback mapping. A skip-only run
// (no `only`) is still a focused run: the schema output is omit-projected, so
// a null affected set must not be mistaken for a full run downstream.
function skippedFocusPaths<F extends TFieldName, G extends TGroupName>(
  skip: InternalSuiteModifiers<F, G>['skip'],
): string[] | null {
  if (!skip) return null;
  const entries = asArray(skip).filter(entry => typeof entry === 'string');
  return entries.length > 0 ? entries : null;
}

/**
 * Focus paths whose parsed values this run is allowed to replace in the
 * retained callback mapping. null means an unfocused full schema run.
 */
function mappedFocusPaths<F extends TFieldName, G extends TGroupName>(
  modifiers: Pick<InternalSuiteModifiers<F, G>, 'only' | 'skip' | '__skipAll'>,
): string[] | null {
  if (modifiers.__skipAll) return [];
  if (modifiers.only == null) return null;
  const skipped = new Set(
    modifiers.skip
      ? asArray(modifiers.skip).filter(
          (entry): entry is F => typeof entry === 'string',
        )
      : [],
  );
  return asArray(modifiers.only).filter(
    (entry): entry is F => typeof entry === 'string' && !skipped.has(entry),
  );
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
  return cloneDataTree(data, true);
}

type CallbackInputParams = {
  affected: string[] | null;
  fallback: unknown;
  previous: MappedSchemaOutput | undefined;
  schema: unknown;
  schemaRunResult: SchemaRunResult[] | undefined;
  skipped: readonly string[] | null;
};

type CallbackMapping = {
  input: unknown;
  retained?: MappedSchemaOutput;
};

/**
 * Resolves the value passed into the user suite callback.
 *
 * Full successful schema runs replace the retained mapped value. Focused
 * successful runs patch only their executed paths into that retained value.
 * This keeps the callback's schema-output type truthful without changing the
 * intentionally per-run semantics of SuiteResult.run.data.parsed.
 * Validation failures keep the established raw-input fallback and do not
 * poison the last successful mapped value.
 */
function getCallbackMapping(params: CallbackInputParams): CallbackMapping {
  const { affected, fallback, previous, schema, schemaRunResult, skipped } =
    params;
  if (!schema) return { input: fallback };
  const successfulResult = successfulSchemaResult(schemaRunResult);
  if (successfulResult === null) {
    return failedCallbackMapping(affected, fallback, previous);
  }
  return successfulCallbackMapping({
    affected,
    fallback,
    previous,
    schema,
    schemaRunResult: successfulResult,
    skipped,
  });
}

function successfulSchemaResult(
  schemaRunResult: SchemaRunResult[] | undefined,
): SchemaRunResult[] | null {
  return schemaRunResult?.every(result => result.pass) ? schemaRunResult : null;
}

/**
 * Installs a successful output as the complete callback mapping. Skip-only
 * runs omit skipped paths from schema execution, so their projected output
 * holds raw input at those paths: restore parsed values from the retained
 * mapping (or a validation-free parser mapping on first runs) first.
 */
function fullCallbackMapping(params: {
  current: unknown;
  fallback: unknown;
  previous: MappedSchemaOutput | undefined;
  schema: unknown;
  skipped: readonly string[] | null;
}): CallbackMapping {
  const { current, fallback, previous, schema, skipped } = params;
  if (skipped !== null) {
    const base = previous?.value ?? mapWithoutValidation(schema, fallback);
    return mappedCallbackResult(repairSkippedPaths(current, base, skipped));
  }
  return mappedCallbackResult(cloneDataTree(current));
}

function failedCallbackMapping(
  affected: string[] | null,
  fallback: unknown,
  previous: MappedSchemaOutput | undefined,
): CallbackMapping {
  return {
    input: cloneDataTree(fallback),
    ...(affected === null || previous === undefined
      ? {}
      : { retained: previous }),
  };
}

function successfulCallbackMapping(
  params: Omit<CallbackInputParams, 'schemaRunResult'> & {
    schemaRunResult: SchemaRunResult[];
  },
): CallbackMapping {
  const { affected, fallback, previous, schema, schemaRunResult, skipped } =
    params;
  const [firstResult] = schemaRunResult;
  const current = firstResult?.type ?? fallback;
  if (affected === null) {
    // A null affected set is either a true full run or a skip-only run; the
    // latter carries an omit-projected output that must be repaired first.
    return fullCallbackMapping({
      current,
      fallback,
      previous,
      schema,
      skipped,
    });
  }

  return focusedCallbackMapping({
    affected,
    current,
    fallback,
    previous,
    schema,
  });
}

function focusedCallbackMapping(params: {
  affected: string[];
  current: unknown;
  fallback: unknown;
  previous: MappedSchemaOutput | undefined;
  schema: unknown;
}): CallbackMapping {
  const { affected, current, fallback, previous, schema } = params;
  const replacesArray = affected.some(field =>
    concreteFieldPath(field).some(segment => typeof segment === 'number'),
  );
  const fresh =
    previous === undefined || replacesArray
      ? mapWithoutValidation(schema, fallback)
      : undefined;
  // Replacing a positional collection requires a complete mapping of its
  // current members. Overlay only the executed leaves onto raw-input parser
  // mapping before replacing the array in retained state.
  const mappedCurrent = replacesArray
    ? mergeMappedPaths(fresh, current, affected, false)
    : current;
  return mappedCallbackResult(
    mergeMappedPaths(
      previous ? previous.value : fresh,
      mappedCurrent,
      affected,
    ),
  );
}

function mappedCallbackResult(value: unknown): CallbackMapping {
  const retained = cloneDataTree(value);
  return {
    input: cloneDataTree(retained),
    retained: { hasValue: true, value: retained },
  };
}

function usePreviousMappedSchemaOutput(): MappedSchemaOutput | undefined {
  const previous =
    VestRuntime.useAvailableRoot<TIsolateSuite>()?.data.mappedSchemaOutput;
  return previous?.hasValue === true ? previous : undefined;
}

function mergeMappedPaths(
  previous: unknown,
  current: unknown,
  affected: readonly string[],
  replaceArrays = true,
): unknown {
  let merged = previous;
  for (const field of affected) {
    const path = mappedMergePath(field, replaceArrays);
    if (path.length === 0) return current;
    if (path.some(isUnsafePathSegment)) continue;
    merged = setPathValue(merged, current, path, 0);
  }
  return merged;
}

function mappedMergePath(
  field: string,
  replaceArrays: boolean,
): ConcretePathSegment[] {
  const path = concreteFieldPath(field);
  return replaceArrays ? retainedMergePath(path) : path;
}

/**
 * Restores parsed values at skipped paths from a complete mapping. Paths the
 * base cannot supply keep the projected output's value rather than being
 * clobbered with undefined.
 */
function repairSkippedPaths(
  current: unknown,
  base: unknown,
  skipped: readonly string[],
): unknown {
  let repaired = cloneDataTree(current);
  for (const field of skipped) {
    const path = retainedMergePath(concreteFieldPath(field));
    if (path.length === 0 || path.some(isUnsafePathSegment)) continue;
    if (readPathDeep(base, path) === undefined) continue;
    repaired = setPathValue(repaired, base, path, 0);
  }
  return repaired;
}

function readPathDeep(
  value: unknown,
  path: readonly ConcretePathSegment[],
): unknown {
  let node = value;
  for (const key of path) {
    node = readPathValue(node, key);
    if (node === undefined) return undefined;
  }
  return node;
}

/**
 * Array indices describe positions, not stable identities. When a focused
 * path enters an array, replace the containing array from the current mapped
 * input so reorder/insert/remove operations cannot leave the callback with a
 * stale structure assembled from the previous run.
 */
function retainedMergePath(
  path: readonly ConcretePathSegment[],
): ConcretePathSegment[] {
  const firstIndex = path.findIndex(segment => typeof segment === 'number');
  return firstIndex === -1 ? [...path] : path.slice(0, firstIndex);
}

type ConcretePathSegment = string | number;

function concreteFieldPath(field: string): ConcretePathSegment[] {
  return parseAffectedFieldName(field).map(segment => {
    if (segment.type === 'property') return String(segment.key);
    const index = Number(segment.binding);
    return Number.isSafeInteger(index) && index >= 0 ? index : segment.binding;
  });
}

function isUnsafePathSegment(segment: ConcretePathSegment): boolean {
  return typeof segment === 'string' && isUnsafeKey(segment);
}

function setPathValue(
  previous: unknown,
  current: unknown,
  path: readonly ConcretePathSegment[],
  index: number,
): unknown {
  if (index >= path.length) return current;
  const key = path[index];
  if (key === undefined) return previous;

  if (index === path.length - 1 && isMissingOwnKey(current, key)) {
    return copyWithoutKey(previous, key);
  }

  const previousChild = readPathValue(previous, key);
  const currentChild = readPathValue(current, key);
  const nextChild = setPathValue(previousChild, currentChild, path, index + 1);
  return writePathValue(previous, key, nextChild);
}

function isMissingOwnKey(value: unknown, key: ConcretePathSegment): boolean {
  return !isObject(value) || !hasOwnProperty(value, key);
}

function copyWithoutKey(value: unknown, key: ConcretePathSegment): unknown {
  const copy = isArray(value)
    ? [...value]
    : { ...(isObject(value) ? value : {}) };
  Reflect.deleteProperty(copy, key);
  return copy;
}

function readPathValue(value: unknown, key: ConcretePathSegment): unknown {
  if (!isObject(value) && !isArray(value)) return undefined;
  return (value as Record<PropertyKey, unknown>)[key];
}

function writePathValue(
  value: unknown,
  key: ConcretePathSegment,
  nextChild: unknown,
): unknown {
  if (isArray(value)) {
    const copy = [...value];
    copy[Number(key)] = nextChild;
    return copy;
  }
  const copy: Record<string, unknown> = isObject(value)
    ? { ...(value as Record<string, unknown>) }
    : {};
  copy[String(key)] = nextChild;
  return copy;
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
  retainedSchemaFailures: SchemaRunResult[];
  suiteCallback: SuiteCallbackWithSchema<S, T>;
  useResolver: () => SuiteResult<F, G, S, D>;
}) {
  const {
    args,
    modifiers,
    schema,
    schemaRunResult,
    retainedSchemaFailures,
    suiteCallback,
    useResolver,
  } = params;

  return () => {
    // Focused modifiers are applied before user callback so every test in this run
    // observes the same focus context.
    only(modifiers.only);
    skip(modifiers.__skipAll || modifiers.skip);
    (suiteCallback as CB)(...args);

    IsolateReorderable(
      runSchemaValidation(
        schema,
        schemaRunResult,
        retainedSchemaFailures,
        modifiers,
      ),
      undefined,
      {
        ...(schema ? { schemaValidation: true } : {}),
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
  modifiers: InternalSuiteModifiers<F, G>,
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
  retained: SchemaRunResult[] = [],
  modifiers?: {
    only?: FieldExclusion<string>;
    skip?: FieldExclusion<string>;
    __skipAll?: boolean;
  },
) {
  // eslint-disable-next-line complexity
  return () => {
    if (!shouldRunSchema(schema) || !schemaRunResult) {
      return;
    }

    // n4s already narrowed these failures. Include their actual attribution
    // only inside this isolate, so parent/root errors remain visible without
    // widening execution of the user's tests.
    only(
      schemaRunResult.filter(result => !result.pass).map(schemaFailureField),
    );
    skip(modifiers?.__skipAll || modifiers?.skip);
    for (const error of [...schemaRunResult, ...retained]) {
      if (error.pass) {
        continue;
      }

      const fieldName = schemaFailureField(error);
      const testKey = schemaFailureKey(error);
      test(fieldName, error.message, () => false, testKey);
    }
  };
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
