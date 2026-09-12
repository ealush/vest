import {
  FocusedSchemaMappingError,
  mapWithoutValidation,
  parseAffectedFieldName,
  runSchemaPaths,
} from 'n4s/exports/internal';
import type {
  MappingProvenance,
  SelectiveExecutionCoverage,
  SelectiveSchemaResult,
} from 'n4s/exports/internal';
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
import { cloneDataTree, cloneDetachedDataTree } from './cloneDataTree';
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
    // Coverage reports whether the run re-evaluated the root rule, so
    // retention can clear global root failures a focused pass proved anew.
    const coverage: SelectiveExecutionCoverage = { rootReevaluated: false };
    const schemaRunResult = shouldRunSchema(schema)
      ? runSchemaPaths(schema, schemaInput, {
          coverage,
          // A plain empty `only` is the established runtime no-op: it restricts
          // nothing, so the schema validates un-narrowed. This is distinct from
          // changed([]), which is explicit zero-field scope and runs nothing. The
          // runtime isolate keeps [] untouched.
          only: nullIfEmptyFocusList(transformedModifiers.only),
          resolvedAffected: changedAffected,
          skip: transformedModifiers.__skipAll || transformedModifiers.skip,
        })
      : undefined;

    const parsedDataChunk = getParsedDataChunk(schemaRunResult);
    // Retention follows the evaluated region: the resolved affected set for
    // changed() runs, the `only` names for inclusion-focused runs. Full runs
    // re-evaluate everything and skip-only runs follow destructive skip
    // semantics, so neither retains.
    const retainedSchemaFailures = useRetainedSchemaFailures(
      changedAffected ?? onlyInclusionOf(transformedModifiers.only),
      skippedFocusPaths(transformedModifiers.skip),
      coverage.rootReevaluated,
    );

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
    const resultOutput = schema
      ? cloneDetachedDataTree(callbackInput)
      : callbackInput;
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

// Inclusion names for schema-failure retention, or null when execution is
// not narrowed by inclusion (full runs and skip-only runs retain nothing).
function onlyInclusionOf<F extends TFieldName, G extends TGroupName>(
  only: InternalSuiteModifiers<F, G>['only'],
): string[] | null {
  if (!only) return null;
  if (Array.isArray(only) && only.length === 0) return null;
  return baseOnlyListOf(only);
}

// A plain empty `only` list restricts nothing (the established runtime
// no-op), so it normalizes to null — a full un-narrowed run.
function nullIfEmptyFocusList<F extends TFieldName, G extends TGroupName>(
  only: InternalSuiteModifiers<F, G>['only'],
): InternalSuiteModifiers<F, G>['only'] | null {
  if (Array.isArray(only) && only.length === 0) return null;
  return only;
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
  // Output presence is distinguished from output value: present null and
  // present undefined are both valid parser outputs. Only a missing type
  // key falls back to the empty mapping.
  if (firstResult === undefined || !hasOwnProperty(firstResult, 'type')) {
    return {};
  }
  return firstResult.type;
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
    return failedCallbackMapping(affected, fallback, previous, schema);
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
    const { fresh, unions } = focusedMappingSource(schema, fallback, false);
    const base = previous === undefined ? fresh : previous.value;
    assertSkippedUnionCoverage({ base, fallback, previous, skipped, unions });
    return mappedCallbackResult(repairSkippedPaths(current, base, skipped));
  }
  return mappedCallbackResult(cloneDetachedDataTree(current));
}

function failedCallbackMapping(
  affected: string[] | null,
  fallback: unknown,
  previous: MappedSchemaOutput | undefined,
  schema: unknown,
): CallbackMapping {
  // The callback type promises schema output, so a failing run delivers
  // best-effort parser mapping instead of raw input. Only pure parser
  // steps run here (validators already ran as part of validation);
  // unmappable input falls back to raw rather than throwing the run.
  // Fields that failed parsing keep the values mapping produced for them.
  return {
    input: cloneDetachedDataTree(mappedFailureInput(schema, fallback)),
    ...(affected === null || previous === undefined
      ? {}
      : { retained: previous }),
  };
}

function mappedFailureInput(schema: unknown, fallback: unknown): unknown {
  try {
    return mapWithoutValidation(schema, fallback);
  } catch {
    return fallback;
  }
}

function successfulCallbackMapping(
  params: Omit<CallbackInputParams, 'schemaRunResult'> & {
    schemaRunResult: SchemaRunResult[];
  },
): CallbackMapping {
  const { affected, fallback, previous, schema, schemaRunResult, skipped } =
    params;
  const [firstResult] = schemaRunResult;
  // Output presence is distinguished from output value: present null and
  // present undefined are both valid parser outputs. Only a missing type
  // key falls back to the raw input.
  const current =
    firstResult !== undefined && hasOwnProperty(firstResult, 'type')
      ? firstResult.type
      : fallback;
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
  // Pure parser mapping of the current input, with provenance: which paths
  // a parser step actually produced. Array merging uses it to prefer
  // current-run parser output over stale retained mappings when values
  // alone cannot decide (an idempotent parser output equals raw input).
  const { fresh, mapping, unions } = focusedMappingSource(
    schema,
    fallback,
    replacesArray,
  );
  assertUnionBranchCoverage(unions, affected, previous, fallback);
  const value = mergeMappedPaths(
    mergeBase(fresh, previous, unions, fallback),
    current,
    affected,
    true,
    fallback,
    mapping,
  );
  // Empty focus is best-effort declaration data, not a successful mapping
  // proof. Preserve history without promoting raw union passthrough to a
  // witness for the next nonempty run.
  if (affected.length === 0) {
    return { input: cloneDetachedDataTree(value), retained: previous };
  }
  return mappedCallbackResult(value);
}

function assertSkippedUnionCoverage(params: {
  unions: ReadonlyArray<readonly ConcretePathSegment[]>;
  skipped: readonly string[];
  base: unknown;
  fallback: unknown;
  previous: MappedSchemaOutput | undefined;
}): void {
  const { unions, skipped, base, fallback, previous } = params;
  const restored = skipped.map(field =>
    retainedMergePath(concreteFieldPath(field)),
  );
  for (const union of unions) {
    if (!restored.some(path => sharesValidationLine(path, union))) continue;
    const members = readPathDeep(
      hasPathDeep(base, union) ? base : fallback,
      union,
    );
    if (isArray(members)) assertUnionMembers(union, members, [], previous);
  }
}

function focusedMappingSource(
  schema: unknown,
  fallback: unknown,
  replacesArray: boolean,
): {
  fresh: unknown;
  mapping: ArrayMergeMapping | undefined;
  unions: ReadonlyArray<readonly ConcretePathSegment[]>;
} {
  // Union incompleteness is collected on every focused mapping: the error
  // boundary needs it even when array merging does not run. The fresh
  // parser mapping always runs: besides provenance, it seeds the merge
  // base so declaration-time control flow observes current input values.
  const provenance: MappingProvenance = { mapped: [], unions: [] };
  const fresh = mapWithoutValidation(schema, fallback, provenance);
  return {
    fresh,
    mapping: replacesArray ? { fresh, mapped: provenance.mapped } : undefined,
    unions: provenance.unions,
  };
}

/**
 * Merge base for focused callback data. Scalar leaves present in the
 * current input read current values when no observable transform produced
 * a new one (identity mapping preserves types by construction), so
 * declaration-time control flow (each lists, conditionals) observes the
 * input a test was declared under: a test that only exists under new input
 * must still be declared before focus matching can select it. Everything
 * else stays retained: containers merge as units (deep structure, union
 * witnesses, and parser consistency inside an object travel together),
 * transformed scalars keep the mapping that preserves the raw/parsed gap,
 * and absent paths fill from retention (hydration). Affected paths overlay
 * from the current run afterwards, as before. The merge is pure: inputs
 * are never mutated, so sharing stored references into the base is safe.
 */
function mergeBase(
  fresh: unknown,
  previous: MappedSchemaOutput | undefined,
  unions: ReadonlyArray<readonly ConcretePathSegment[]>,
  fallback: unknown,
): unknown {
  if (previous === undefined) return fresh;
  const retained = previous.value;
  const seeded = seedUnionWitnesses(
    freshOrRetained(fresh, retained),
    retained,
    unions,
  );
  if (!isRecord(seeded) || !isRecord(fallback) || !isRecord(retained)) {
    return seeded;
  }
  return reconcileTopLevel(seeded, retained, fallback);
}

function freshOrRetained(fresh: unknown, retained: unknown): unknown {
  return fresh !== undefined ? fresh : retained;
}

function seedUnionWitnesses(
  base: unknown,
  retained: unknown,
  unions: ReadonlyArray<readonly ConcretePathSegment[]>,
): unknown {
  let next = base;
  for (const union of unions) {
    if (hasPathDeep(retained, union)) {
      next = writePathAt(next, union, readPathDeep(retained, union));
    }
  }
  return next;
}

function isRecord(value: unknown): value is Record<PropertyKey, unknown> {
  return isObject(value) && !isArray(value);
}

function reconcileTopLevel(
  base: Record<PropertyKey, unknown>,
  retained: Record<PropertyKey, unknown>,
  fallback: Record<PropertyKey, unknown>,
): unknown {
  return fillAbsentKeys(
    restoreTopLevelKeys(base, retained, fallback),
    retained,
    fallback,
  );
}

function restoreTopLevelKeys(
  base: Record<PropertyKey, unknown>,
  retained: Record<PropertyKey, unknown>,
  fallback: Record<PropertyKey, unknown>,
): unknown {
  let next: unknown = base;
  for (const key of Object.keys(fallback)) {
    next = restoreTopLevelKey(next, retained, fallback[key], key);
  }
  return next;
}

function restoreTopLevelKey(
  next: unknown,
  retained: Record<PropertyKey, unknown>,
  inputValue: unknown,
  key: string,
): unknown {
  if (isContainerValue(inputValue)) {
    // Containers merge as retained units; a freshly added container has
    // no retained unit and keeps its fresh mapping.
    return restoreIfRetained(next, retained, key);
  }
  // Identity-mapped scalars already hold the current input value in the
  // fresh base. A transformed scalar (fresh output observably differs from
  // the input) keeps the retained mapping; without retention the fresh
  // output stands on its own.
  if (Object.is(readPathValue(next, key), inputValue)) return next;
  return restoreIfRetained(next, retained, key);
}

function restoreIfRetained(
  next: unknown,
  retained: Record<PropertyKey, unknown>,
  key: string,
): unknown {
  if (!hasOwnProperty(retained, key)) return next;
  return writePathValue(next, key, retained[key]);
}

function isContainerValue(value: unknown): boolean {
  return isObject(value) || isArray(value);
}

function fillAbsentKeys(
  next: unknown,
  retained: Record<PropertyKey, unknown>,
  fallback: Record<PropertyKey, unknown>,
): unknown {
  let filled: unknown = next;
  for (const key of Object.keys(retained)) {
    if (!hasOwnProperty(fallback, key) && !hasOwnProperty(filled, key)) {
      filled = writePathValue(filled, key, retained[key]);
    }
  }
  return filled;
}

/**
 * Explicit error boundary for untouched unions without a mapping witness.
 * Parser-only mapping cannot choose a union branch without validation; when
 * neither focus coverage (the current run validated the member) nor a
 * retained prior mapping proves the output, the typed callback must not
 * observe raw input as schema output. changed([]) promises no mapping and
 * is exempt. Failure-path callbacks are best-effort by contract and never
 * reach this boundary.
 */
function assertUnionBranchCoverage(
  unions: ReadonlyArray<readonly ConcretePathSegment[]>,
  affected: string[],
  previous: MappedSchemaOutput | undefined,
  fallback: unknown,
): void {
  if (affected.length === 0) return;
  const covering = affected
    .map(concreteFieldPath)
    .filter(path => !path.some(isUnsafePathSegment));
  for (const union of unions) {
    const members = readPathDeep(fallback, union);
    if (isArray(members)) {
      assertUnionMembers(union, members, covering, previous);
    }
  }
}

function assertUnionMembers(
  union: readonly ConcretePathSegment[],
  members: unknown[],
  covering: ConcretePathSegment[][],
  previous: MappedSchemaOutput | undefined,
): void {
  for (let index = 0; index < members.length; index++) {
    const member = [...union, index];
    if (isUnionMemberCovered(member, covering, previous)) continue;
    throw new FocusedSchemaMappingError(
      `Focused schema mapping cannot select a union branch at "${formatUnionPath(member)}" without running validation or reusing a prior mapped result. Run a full validation first to establish a branch witness, or include the union path in the focused fields.`,
    );
  }
}

function isUnionMemberCovered(
  member: readonly ConcretePathSegment[],
  covering: ConcretePathSegment[][],
  previous: MappedSchemaOutput | undefined,
): boolean {
  if (covering.some(path => sharesValidationLine(path, member))) return true;
  return previous !== undefined && hasPathDeep(previous.value, member);
}

// Two paths share a validation line when one reaches (or passes through)
// the other: validation at or above a member maps it via expansion, and
// validation at or below it maps it directly. Siblings share no line.
function sharesValidationLine(
  path: readonly ConcretePathSegment[],
  member: readonly ConcretePathSegment[],
): boolean {
  const shorter = path.length <= member.length ? path : member;
  const longer = path.length <= member.length ? member : path;
  return shorter.every((segment, position) => segment === longer[position]);
}

function formatUnionPath(path: readonly ConcretePathSegment[]): string {
  return path
    .map(segment =>
      typeof segment === 'number' ? `[${segment}]` : `.${segment}`,
    )
    .join('')
    .replace(/^\./, '');
}

/**
 * Current-run parser mapping for array merging. `fresh` is the pure
 * parser output; `mapped` lists the paths a parser step produced, so an
 * idempotent output (equal to raw input) still counts as mapped.
 */
type ArrayMergeMapping = {
  readonly fresh: unknown;
  readonly mapped: ReadonlyArray<readonly ConcretePathSegment[]>;
};

function mappedCallbackResult(value: unknown): CallbackMapping {
  const retained = cloneDetachedDataTree(value);
  return {
    input: cloneDetachedDataTree(retained),
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
  fallback: unknown = current,
  mapping?: ArrayMergeMapping,
): unknown {
  const fields = affected.map(concreteFieldPath);
  if (fields.some(isEmptyPath)) return current;
  let merged = previous;
  for (const full of topmostFields(fields)) {
    merged = mergeMappedField(
      merged,
      current,
      fallback,
      full,
      replaceArrays,
      mapping,
    );
  }
  return merged;
}

/**
 * An affected ancestor subsumes its descendant merge paths: merging the
 * parent already covers the whole subtree, and merging a descendant
 * afterward would recreate a parent the merge deleted (e.g. removing an
 * optional object resurrects it as empty).
 */
function topmostFields(
  fields: readonly ConcretePathSegment[][],
): ConcretePathSegment[][] {
  return fields.filter(
    (field, index) =>
      !fields.some(
        (other, otherIndex) =>
          otherIndex !== index && isStrictPrefixPath(other, field),
      ),
  );
}

function isStrictPrefixPath(
  prefix: readonly ConcretePathSegment[],
  path: readonly ConcretePathSegment[],
): boolean {
  return (
    prefix.length < path.length &&
    prefix.every((segment, index) => segment === path[index])
  );
}

function isEmptyPath(full: readonly ConcretePathSegment[]): boolean {
  return full.length === 0;
}

function mergeMappedField(
  merged: unknown,
  current: unknown,
  fallback: unknown,
  full: readonly ConcretePathSegment[],
  replaceArrays: boolean,
  mapping?: ArrayMergeMapping,
): unknown {
  if (full.some(isUnsafePathSegment)) return merged;
  return replaceArrays
    ? mergeArrayField(merged, current, fallback, full, mapping)
    : setPathValue(merged, current, full, 0);
}

/**
 * Merges one affected path when arrays replace wholesale. Non-array paths
 * merge at full depth. For array ancestors with matching structure, the
 * executed index comes from the current output while unexecuted members
 * prefer the retained mapping whenever the current output left them
 * identical to the raw input (unmapped union members); mapped members keep
 * current-input provenance. Structural changes replace the whole array.
 */
function mergeArrayField(
  merged: unknown,
  current: unknown,
  fallback: unknown,
  full: readonly ConcretePathSegment[],
  mapping?: ArrayMergeMapping,
): unknown {
  const firstIndex = full.findIndex(segment => typeof segment === 'number');
  if (firstIndex === -1) {
    if (full.length === 0) return current;
    return setPathValue(merged, current, full, 0);
  }
  const ancestor = full.slice(0, firstIndex);
  if (ancestor.some(isUnsafePathSegment)) return merged;
  const pair = arrayPairAt(merged, current, ancestor);
  if (pair === null) {
    return setPathValue(merged, current, ancestor, 0);
  }
  const executed = full[firstIndex] as number;
  return writePathAt(
    merged,
    ancestor,
    mergeArrayMembers(pair, fallback, ancestor, executed, mapping),
  );
}

type ArrayMergePair = {
  readonly previous: unknown[];
  readonly current: unknown[];
};

function arrayPairAt(
  merged: unknown,
  current: unknown,
  ancestor: readonly ConcretePathSegment[],
): ArrayMergePair | null {
  const previousArray = readPathDeep(merged, ancestor);
  const currentArray = readPathDeep(current, ancestor);
  if (!isArray(previousArray) || !isArray(currentArray)) return null;
  if (previousArray.length !== currentArray.length) return null;
  return { current: currentArray, previous: previousArray };
}

function mergeArrayMembers(
  pair: ArrayMergePair,
  fallback: unknown,
  ancestor: readonly ConcretePathSegment[],
  executed: number,
  mapping?: ArrayMergeMapping,
): unknown[] {
  const inputArray = readPathDeep(fallback, ancestor);
  const next = [...pair.current];
  for (let index = 0; index < next.length; index++) {
    next[index] = mergedMember(
      pair,
      inputArray,
      index,
      executed,
      ancestor,
      mapping,
    );
  }
  return next;
}

function mergedMember(
  pair: ArrayMergePair,
  inputArray: unknown,
  index: number,
  executed: number,
  ancestor: readonly ConcretePathSegment[],
  mapping?: ArrayMergeMapping,
): unknown {
  if (index === executed) return pair.current[index];
  // A parser-mapped member carries current-run output even when it equals
  // the raw input (idempotent parsers): prefer it over stale retention.
  // Unmapped members keep the retained mapping (e.g. union branches the
  // pure mapping pass cannot choose without validation).
  if (
    mapping !== undefined &&
    isParserMapped(mapping.mapped, [...ancestor, index])
  ) {
    return readPathDeep(mapping.fresh, [...ancestor, index]);
  }
  return retainedMember(pair, inputArray, index);
}

function retainedMember(
  pair: ArrayMergePair,
  inputArray: unknown,
  index: number,
): unknown {
  const inputMember = isArray(inputArray) ? inputArray[index] : undefined;
  if (Object.is(pair.current[index], inputMember)) {
    return pair.previous[index];
  }
  return pair.current[index];
}

/**
 * Whether a parser step produced this run's value at (or under) the member
 * path. Marks strictly above the member never count: a container-level
 * parser may pass members through untouched (e.g. an array slot over union
 * members it cannot choose), so only execution for the member itself —
 * including idempotent output equal to raw input — proves mapping.
 */
function isParserMapped(
  mapped: ReadonlyArray<readonly ConcretePathSegment[]>,
  path: readonly ConcretePathSegment[],
): boolean {
  return mapped.some(candidate => isAtOrUnderPath(candidate, path));
}

function isAtOrUnderPath(
  candidate: readonly ConcretePathSegment[],
  path: readonly ConcretePathSegment[],
): boolean {
  if (candidate.length < path.length) return false;
  for (let index = 0; index < path.length; index += 1) {
    if (candidate[index] !== path[index]) return false;
  }
  return true;
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
  let repaired = cloneDetachedDataTree(current);
  for (const field of skipped) {
    const path = retainedMergePath(concreteFieldPath(field));
    if (path.length === 0 || path.some(isUnsafePathSegment)) continue;
    // Presence decides: an explicitly undefined mapped value restores
    // undefined; only a path the base cannot supply keeps the projected
    // output's value.
    if (!hasPathDeep(base, path)) continue;
    repaired = setPathValue(repaired, base, path, 0);
  }
  return repaired;
}

/**
 * Whether a path resolves through present own properties. Unlike
 * readPathDeep, a present undefined reads as present — presence metadata
 * for values where undefined is a legitimate mapped output.
 */
function hasPathDeep(
  value: unknown,
  path: readonly ConcretePathSegment[],
): boolean {
  let node = value;
  for (const key of path) {
    if (!isObject(node) && !isArray(node)) return false;
    if (!hasOwnProperty(node, key)) return false;
    node = readPathValue(node, key);
  }
  return true;
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
 * Writes a complete replacement value at a path. Unlike setPathValue (which
 * walks a parallel current tree), the value here is used as-is.
 */
function writePathAt(
  base: unknown,
  path: readonly ConcretePathSegment[],
  value: unknown,
): unknown {
  if (path.length === 0) return value;
  const [head, ...tail] = path;
  if (head === undefined) return base;
  return writePathValue(
    base,
    head,
    writePathAt(readPathValue(base, head), tail, value),
  );
}

/**
 * Array indices describe positions, not stable identities. When a path
 * enters an array, replace the containing array wholesale so no stale
 * structure is assembled. Skipped regions keep no current values at all:
 * whole subtrees come from the trusted base mapping.
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
    // Fresh results come first and are authoritative: a retained verdict
    // identical to an already-synthesized failure (e.g. a root failure the
    // fresh run also reports) adds no information, and the tree forbids
    // duplicate sibling keys — synthesizing both throws.
    const seenKeys = new Set<string>();
    for (const error of [...schemaRunResult, ...retained]) {
      if (error.pass) {
        continue;
      }

      const fieldName = schemaFailureField(error);
      const testKey = schemaFailureKey(error);
      if (seenKeys.has(testKey)) {
        continue;
      }
      seenKeys.add(testKey);
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
