import { runSchemaPaths } from 'n4s/exports/internal';
import type {
  SelectiveExecutionCoverage,
  SelectiveSchemaResult,
} from 'n4s/exports/internal';
import {
  assign,
  asArray,
  CB,
  freezeAssign,
  isArray,
  isBoolean,
  isNullish,
  isStringValue,
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
  TSchema,
  DraftSchemaOutput,
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
import { cloneDataTree, cloneDeclarationInput } from './cloneDataTree';
import { applySchemaOutput, schemaOutput } from './schemaOutput';
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

    // Retention follows the evaluated region: the resolved affected set for
    // changed() runs, the `only` names for inclusion-focused runs. Full runs
    // re-evaluate everything and skip-only runs follow destructive skip
    // semantics, so neither retains.
    const retainedSchemaFailures = useRetainedSchemaFailures(
      changedAffected ?? onlyInclusionOf(transformedModifiers.only),
      skippedFocusPaths(transformedModifiers.skip),
      coverage.rootReevaluated,
    );

    const fullSchemaRun = isFullSchemaRun(changedFields, transformedModifiers);
    const output = schema
      ? schemaOutput(
          schemaRunResult,
          fullSchemaRun ? null : mappedAffected,
          skippedFocusPaths(transformedModifiers.skip),
          transformedModifiers.skip === true ||
            transformedModifiers.__skipAll === true,
        )
      : schemaInput;
    const parsedData = (schema ? cloneDataTree(output, true) : undefined) as
      | DraftSchemaOutput<S>
      | undefined;
    // Vest 6 contract: a passing run hands the callback its input with this
    // run's parsed values applied (complete output on a full run).
    // changed() runs and failed runs describe the supplied input. Callbacks
    // never trigger a second parser pass.
    const appliesOutput =
      !!schema && !changedFields && schemaPassed(schemaRunResult);
    const callbackInput = !schema
      ? schemaInput
      : appliesOutput
        ? fullSchemaRun
          ? cloneDataTree(output)
          : applySchemaOutput(cloneDeclarationInput(schemaInput), output)
        : cloneDeclarationInput(schemaInput);
    const callbackArgs = [callbackInput, ...args.slice(1)] as Parameters<T>;
    const resultOutput = schema ? cloneDataTree(output) : callbackInput;
    // run.data.raw keeps the established raw-input identity unless this run
    // applied parsed output to it.
    const runDataSnapshot = appliesOutput
      ? cloneDataTree(callbackInput)
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
  return asArray(only).filter(isStringValue);
}

// Inclusion names for schema-failure retention, or null when execution is
// not narrowed by inclusion (full runs and skip-only runs retain nothing).
function onlyInclusionOf<F extends TFieldName, G extends TGroupName>(
  only: InternalSuiteModifiers<F, G>['only'],
): string[] | null {
  if (!only) return null;
  if (isArray(only) && only.length === 0) return null;
  return baseOnlyListOf(only);
}

/**
 * A run that validates the whole schema: no changed() scope, no inclusion
 * focus, and nothing skipped. Only such a run can establish complete output.
 */
function isFullSchemaRun<F extends TFieldName, G extends TGroupName>(
  changedFields: unknown,
  modifiers: Pick<InternalSuiteModifiers<F, G>, 'only' | 'skip' | '__skipAll'>,
): boolean {
  return (
    !changedFields &&
    !modifiers.__skipAll &&
    modifiers.skip !== true &&
    onlyInclusionOf(modifiers.only) === null &&
    skippedFocusPaths(modifiers.skip) === null
  );
}

function schemaPassed(
  results: readonly SchemaRunResult[] | undefined,
): boolean {
  return !!results?.length && results.every(result => result.pass);
}

// A plain empty `only` list restricts nothing (the established runtime
// no-op), so it normalizes to null — a full un-narrowed run.
function nullIfEmptyFocusList<F extends TFieldName, G extends TGroupName>(
  only: InternalSuiteModifiers<F, G>['only'],
): InternalSuiteModifiers<F, G>['only'] | null {
  if (isArray(only) && only.length === 0) return null;
  return only;
}

// String entries of the `skip` modifier for callback mapping. A skip-only run
// (no `only`) is still a focused run: the schema output is omit-projected, so
// a null affected set must not be mistaken for a full run downstream.
function skippedFocusPaths<F extends TFieldName, G extends TGroupName>(
  skip: InternalSuiteModifiers<F, G>['skip'],
): string[] | null {
  if (!skip) return null;
  const entries = asArray(skip).filter(isStringValue);
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
  if (isNullish(modifiers.only)) return null;
  const skipped = new Set(
    modifiers.skip ? asArray(modifiers.skip).filter(isStringValue) : [],
  );
  return asArray(modifiers.only)
    .filter(isStringValue)
    .filter(entry => !skipped.has(entry));
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
    // observes the same focus context. Caller-owned readonly lists normalize
    // to mutable copies at this runtime boundary (see copyFieldLists).
    only(mutableOnlyList(modifiers.only));
    skip(modifiers.__skipAll || mutableSkipList(modifiers.skip));
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
 * Normalizes a caller-owned inclusion list for the runtime focus hooks:
 * readonly arrays become mutable copies, non-string entries drop out.
 */
function mutableOnlyList(value: unknown): FieldExclusion<string> | undefined {
  if (isNullish(value)) return undefined;
  if (isArray(value)) {
    return value.filter(isStringValue);
  }
  return isStringValue(value) ? value : undefined;
}

function mutableSkipList(
  value: unknown,
): FieldExclusion<string> | boolean | undefined {
  if (isNullish(value)) return undefined;
  if (isBoolean(value)) return value;
  if (isArray(value)) {
    return value.filter(isStringValue);
  }
  return isStringValue(value) ? value : undefined;
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
    only?: unknown;
    skip?: unknown;
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
    skip(modifiers?.__skipAll || mutableSkipList(modifiers?.skip));
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
