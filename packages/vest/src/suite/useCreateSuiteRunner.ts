import { parseAffectedFieldName, runSchemaPaths } from 'n4s';
import type { SelectiveSchemaResult } from 'n4s';
import {
  assign,
  asArray,
  CB,
  freezeAssign,
  isArray,
  isObject,
  isUnsafeKey,
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

import { getAffectedFields } from './changed';
import type { FieldExclusion } from '../hooks/focused/focused';
import { SuiteModifiers, SuiteCallbackWithSchema } from './SuiteTypes';

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
 * alone misattributes: ambient-context state identity stays poisoned after
 * any throw inside a persisted wrapper (the context primitive restores
 * nothing on throw), while the callback alone aliases suites built from
 * one shared callback and runStatic calls. The composite key is correct in
 * all three cases.
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

/**
 * Last successfully mapped callback input per concrete suite state.
 *
 * This is intentionally distinct from SuiteResult.run.data.parsed. Parsed
 * result metadata stays per-run (the v6 contract); this cache exists only so
 * a focused schema run does not violate the callback's full schema-output
 * type by replacing untouched transformed fields with raw input values.
 */
const mappedCallbackData = new WeakMap<CB, WeakMap<object, unknown>>();

function pendingRunsFor(suiteCallback: CB): WeakMap<object, Set<unknown>> {
  const existing = pendingRuns.get(suiteCallback);
  if (existing !== undefined) {
    return existing;
  }
  const created = new WeakMap<object, Set<unknown>>();
  pendingRuns.set(suiteCallback, created);
  return created;
}

function mappedDataFor(suiteCallback: CB): WeakMap<object, unknown> {
  const existing = mappedCallbackData.get(suiteCallback);
  if (existing !== undefined) return existing;
  const created = new WeakMap<object, unknown>();
  mappedCallbackData.set(suiteCallback, created);
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
  modifiers: SuiteModifiers<F, G>,
  schema?: S,
) {
  // Defer changed() expansion: if __changed is present, compute affected
  // using the actual run data (enables root->array fan-out).
  const changedFields = modifiers.__changed;
  // Note: we cannot compute affected here without data, so we do it inside runSuite below.
  const transformedModifiersBase = useTransformedModifiers<F, G>(modifiers);

  // eslint-disable-next-line complexity -- orchestration branches mirror suite modifiers
  return function runSuite(
    ...args: S extends undefined
      ? Parameters<T>
      : [data: InferSchemaData<S>, ...args: any[]]
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
    const forgetPendingRun = chainSupersededRuns(
      suiteCallback,
      suiteState,
      promise,
      rawResolve,
    );
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
    // execute; the schema run below takes the raw changed names instead —
    // runSchemaPaths owns the single expansion of the run path.
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

    // Dependency-aware schema execution is owned by n4s behind one
    // contract: raw changed() names in, expanded validation out. Suite-test
    // focus above stays expanded so dependents' user tests execute.
    const schemaRunResult = shouldRunSchema(schema)
      ? runSchemaPaths(schema, schemaInput, {
          affected: changedAffected,
          only: transformedModifiers.only,
          skip: transformedModifiers.skip,
        })
      : undefined;

    const parsedDataChunk = getParsedDataChunk(schemaRunResult);

    const parsedData = (
      schema ? snapshotParsedData(parsedDataChunk) : undefined
    ) as Partial<InferSchemaOutput<S>> | undefined;

    const callbackInput = getCallbackInput({
      affected: mappedAffected,
      fallback: schemaInput,
      schema,
      schemaRunResult,
      state: suiteState,
      suiteCallback,
    });
    const callbackArgs = [callbackInput, ...args.slice(1)] as Parameters<T>;
    const runData =
      schema && schemaRunResult?.every(result => result.pass)
        ? parsedDataChunk
        : schemaInput;

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
 * Resolves changed() run focus from the raw changed names and run data:
 * the expanded affected set drives suite-test selection (dependents' user
 * tests must execute), while the schema input stays raw — the unexpanded
 * changed names plus base `only` names (so combined only+changed still
 * validates the base fields). runSchemaPaths expands the schema input
 * internally; pre-expanding here as well would apply fan-out twice and
 * compose transitively, breaking the pinned non-transitive changed()
 * contract.
 */
function useChangedRunFocus<F extends TFieldName, G extends TGroupName>(
  changedFields: string[],
  modifiers: SuiteModifiers<F, G>,
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
  const withAffected: SuiteModifiers<F, G> = {
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
    withAffected.skip = true;
  }
  delete withAffected.__changed;
  const rawChanged = changedFields.filter(
    (entry): entry is string => typeof entry === 'string',
  );
  return {
    transformedModifiers: useTransformedModifiers<F, G>(withAffected),
    changedAffected: [...new Set([...rawChanged, ...baseList])],
    mappedAffected: mappedFocusPaths(withAffected) ?? [],
  };
}

// Non-string entries (e.g. a runtime boolean) never reach field-name
// normalization, which would throw on them — same guard as skip-all.
function baseOnlyListOf<F extends TFieldName, G extends TGroupName>(
  only: SuiteModifiers<F, G>['only'],
): string[] {
  if (!only) return [];
  return asArray(only).filter(entry => typeof entry === 'string');
}

/**
 * Focus paths whose parsed values this run is allowed to replace in the
 * retained callback mapping. null means an unfocused full schema run.
 */
function mappedFocusPaths<F extends TFieldName, G extends TGroupName>(
  modifiers: Pick<SuiteModifiers<F, G>, 'only' | 'skip'>,
): string[] | null {
  if (modifiers.skip === true) return [];
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
  if (isArray(data)) {
    return Object.freeze([...(data as unknown[])]);
  }
  if (isObject(data)) {
    return freezeAssign({}, data as object);
  }
  return data;
}

type CallbackInputParams = {
  affected: string[] | null;
  fallback: unknown;
  schema: unknown;
  schemaRunResult: SchemaRunResult[] | undefined;
  state: object;
  suiteCallback: CB;
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
// eslint-disable-next-line complexity -- full, failed, initial, and retained snapshots
function getCallbackInput(params: CallbackInputParams): unknown {
  const { affected, fallback, schema, schemaRunResult, state, suiteCallback } =
    params;
  if (!schemaRunResult || schemaRunResult.some(result => !result.pass)) {
    return fallback;
  }

  const [firstResult] = schemaRunResult;
  const current = firstResult?.type ?? fallback;
  const cache = mappedDataFor(suiteCallback);

  if (affected === null) {
    cache.set(state, current);
    return current;
  }

  const previous = cache.get(state);
  if (previous === undefined) {
    const initial = mapWithoutValidation(schema, fallback);
    const merged = mergeMappedPaths(initial, current, affected);
    cache.set(state, merged);
    return merged;
  }

  const merged = mergeMappedPaths(previous, current, affected);
  cache.set(state, merged);
  return merged;
}

type MappingResult = { pass: boolean; type: unknown };
type InternalRule = Record<PropertyKey, unknown>;
const MAP_VALUE = Symbol.for('vest:mapValue');
const ITEM_SCHEMA = Symbol.for('vest:itemSchema');
const ITEM_CONTAINER = Symbol.for('vest:itemContainer');

/** Maps parser steps while deliberately skipping validation predicates. */
function mapWithoutValidation(rule: unknown, value: unknown): unknown {
  if (!isObject(rule)) return value;
  const slots = rule as InternalRule;
  const mapped = mapStructuredValue(slots, value);
  const mapValue = slots[MAP_VALUE];
  if (typeof mapValue !== 'function') return mapped;
  const result = (mapValue as (input: unknown) => MappingResult)(mapped);
  return result.pass ? result.type : mapped;
}

// eslint-disable-next-line complexity -- discriminates shape, tuple, array, and record metadata
function mapStructuredValue(rule: InternalRule, value: unknown): unknown {
  const shape = rule.__schema;
  if (isObject(shape) && isObject(value) && !isArray(value)) {
    const output = { ...(value as object) } as Record<string, unknown>;
    for (const key of Object.keys(shape as object)) {
      if (Object.prototype.hasOwnProperty.call(output, key)) {
        output[key] = mapWithoutValidation(
          (shape as Record<string, unknown>)[key],
          output[key],
        );
      }
    }
    return output;
  }

  const itemSchema = rule[ITEM_SCHEMA];
  if (isArray(value) && itemSchema !== undefined) {
    if (isArray(itemSchema)) {
      // Multi-rule arrays are unions, so choosing a mapper would require
      // running validators. Tuple metadata has no container discriminator.
      if (rule[ITEM_CONTAINER] === 'array') return value;
      return value.map((item, index) =>
        mapWithoutValidation(itemSchema[index], item),
      );
    }
    return value.map(item => mapWithoutValidation(itemSchema, item));
  }
  if (
    rule[ITEM_CONTAINER] === 'record' &&
    itemSchema !== undefined &&
    isObject(value) &&
    !isArray(value)
  ) {
    return Object.fromEntries(
      Object.entries(value as object).map(([key, item]) => [
        key,
        mapWithoutValidation(itemSchema, item),
      ]),
    );
  }
  return value;
}

function mergeMappedPaths(
  previous: unknown,
  current: unknown,
  affected: readonly string[],
): unknown {
  if (affected.length === 0) return previous;
  let merged = previous;
  for (const field of affected) {
    const path = concreteFieldPath(field);
    if (path.length === 0 || path.some(isUnsafePathSegment)) continue;
    merged = setPathValue(merged, current, path, 0);
  }
  return merged;
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

  const previousChild = readPathValue(previous, key);
  const currentChild = readPathValue(current, key);
  const nextChild = setPathValue(previousChild, currentChild, path, index + 1);
  return writePathValue(previous, key, nextChild);
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
    only(withSchemaFailureFocus(modifiers.only, schemaRunResult));
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
 * Widens execution focus to cover already-narrowed schema failures reported
 * above the affected leaves (e.g. a union element failure at 'rows.1' for
 * changed('rows.1.kind')). The post-filter keeps failures parent-either-way,
 * but suite focus matches test names exactly, so a coarser attribution would
 * be emitted and then excluded — reported nowhere. Only strict parents of
 * focused names are added: leaf failures already match exactly, and child
 * failures keep their existing behavior, so user-test execution is otherwise
 * unchanged.
 */
function withSchemaFailureFocus<F extends TFieldName>(
  only: FieldExclusion<F>,
  schemaRunResult: readonly SchemaRunResult[] | undefined,
): FieldExclusion<F> {
  if (schemaRunResult === undefined) {
    return only;
  }
  const base = focusBaseNames(only);
  if (base === null) {
    return only;
  }
  const additions = parentFocusAdditions<F>(base.map(String), schemaRunResult);
  if (additions.length === 0) {
    return only;
  }
  return [...base, ...additions];
}

function focusBaseNames<F extends TFieldName>(
  only: FieldExclusion<F>,
): F[] | null {
  if (only === undefined || only === null) return null;
  const base = asArray(only);
  return base.length === 0 ? null : base;
}

/**
 * Failure paths that are strict parents of a focused name. A coarser schema
 * attribution (e.g. 'rows.1' for changed('rows.1.kind')) would otherwise be
 * emitted and then excluded by exact focus matching — reported nowhere.
 */
function parentFocusAdditions<F extends TFieldName>(
  baseNames: string[],
  schemaRunResult: readonly SchemaRunResult[],
): F[] {
  const seen = new Set<string>(baseNames);
  const additions: F[] = [];
  for (const result of schemaRunResult) {
    const failureName = schemaFailureName(result);
    if (failureName === '' || seen.has(failureName)) {
      continue;
    }
    if (isParentOfFocusedName(baseNames, failureName)) {
      seen.add(failureName);
      additions.push(failureName as unknown as F);
    }
  }
  return additions;
}

function schemaFailureName(result: SchemaRunResult): string {
  if (result.pass) {
    return '';
  }
  return (result.path ?? []).map(String).join('.');
}

function isParentOfFocusedName(
  baseNames: readonly string[],
  failureName: string,
): boolean {
  return baseNames.some((baseName: string): boolean =>
    baseName.startsWith(`${failureName}.`),
  );
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
