import {
  chainBaselineMatches,
  enforce,
  hasChainBaseline,
  ITEM_CONTAINER,
  ITEM_SCHEMA,
  OPTIONAL_RULE,
  PARTIAL_LIKE,
} from 'n4s';
import type {
  DescribeResult,
  ItemContainerKind,
  ItemSegment,
  PropertySegment,
  SchemaDependency,
  SchemaMemberRule,
  SchemaPath,
} from 'n4s';
import {
  assign,
  asArray,
  CB,
  freezeAssign,
  hasOwnProperty,
  isArray,
  isFunction,
  isNullish,
  isObject,
  isUnsafeKey,
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

import { getAffectedFields, normalizeFieldName } from './changed';
import type { FieldExclusion } from '../hooks/focused/focused';
import { SuiteModifiers, SuiteCallbackWithSchema } from './SuiteTypes';

export type SchemaRunResult = {
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
  const changedFields = modifiers.__changed;
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
    let transformedModifiers = transformedModifiersBase;
    let changedAffected: string[] | null = null;
    if (changedFields) {
      const affected = getAffectedFields(changedFields, schema, schemaInput);
      const mergedOnly: string[] = (() => {
        const baseOnly = modifiers.only;
        if (!baseOnly) return affected;
        // Non-string entries (e.g. a runtime boolean) never reach field-name
        // normalization, which would throw on them — same guard as skip-all.
        const baseList = asArray(baseOnly).filter(
          entry => typeof entry === 'string',
        );
        return [...new Set([...baseList, ...affected])];
      })();
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
        // schema side resolves to an empty pick via buildArrayProp. Note this
        // branch only fires when no base `only` exists either: an explicit
        // only('a') combined with changed([]) intentionally still runs 'a'.
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

/**
 * Attempts to parse the schema. Returns null if parse fails gracefully,
 * so the caller can fall back to schema.run.
 */
function tryParseSchema(
  executableSchema: IntrospectableSchema,
  data: unknown,
): SchemaRunResult[] | null {
  const parse = executableSchema.parse;
  if (!isFunction(parse)) return null;

  try {
    const parsedValue = parse(data);
    return runParsedValue(executableSchema, parsedValue);
  } catch (error) {
    if (isExpectedSchemaParseError(error)) return null;
    throw error;
  }
}

/**
 * Runs a parsed value through the schema's run step when the schema opts
 * into parse-then-run; otherwise the parsed value is the result.
 */
function runParsedValue(
  executableSchema: IntrospectableSchema,
  parsedValue: unknown,
): SchemaRunResult[] {
  const run = executableSchema.run;
  if (shouldRunAfterParse(executableSchema) && isFunction(run)) {
    return normalizeSchemaRunResult(run(parsedValue), parsedValue);
  }
  return [{ pass: true, type: parsedValue }];
}

/**
 * Runs schema parsing/validation in a safe order:
 * 1) try parse
 * 2) if parse succeeds, treat it as the authoritative validation output
 * 3) on expected parse validation failures, fallback to run(raw)
 *
 * changed() with nested affected paths cannot use enforce.pick (it selects
 * top-level keys only, silently dropping nested validation). Run a projected
 * schema limited to the affected subtrees instead: n4s shape/loose reports
 * only its first failure, so running everything and filtering afterward is
 * order-dependent — an unrelated earlier field would hide the affected
 * dependency. Failures are still narrowed to the affected paths afterward.
 * Top-level-only focus keeps the existing pick/omit behavior identical.
 */
function runSchemaWithParse(
  schema: IntrospectableSchema,
  data: unknown,
  modifiers: { only?: unknown; skip?: unknown },
  changedAffected?: string[] | null,
): SchemaRunResult[] {
  const nestedAffected = getNestedChangedAffected(schema, changedAffected);
  if (nestedAffected == null) {
    return runFlatSchema(schema, modifiers, data, changedAffected);
  }
  // Retain dependency sources (local siblings, $.root providers) so the
  // projected fragment still composes to a valid graph. Failures stay
  // narrowed to the original affected paths afterward.
  const expanded = expandAffectedWithSources(schema, nestedAffected);
  const projectedSchema = buildProjectedSchema(schema, expanded);
  const mainRun = runProjectedOrFull(projectedSchema, schema, modifiers, data);
  const supplement = collectSupplementForMain(mainRun, schema, expanded, data);
  // `only` is already merged into the affected set by the caller; `skip`
  // must additionally narrow synthesized failures (the projected run does
  // not take focused modifiers, unlike `applySchemaFocus`).
  const skip = buildSkipFilter(modifiers.skip);
  if (supplement.gap) {
    // A member that cannot run standalone (orphaned root edge) would be
    // silently omitted — run everything with post-filtering instead.
    const full = runExecutableSchema(
      changedFallbackSchema(schema, modifiers),
      data,
    );
    return filterSchemaResultsToAffected(full, nestedAffected, data, skip);
  }
  const merged = mergeSupplementalResults(mainRun.results, supplement.results);
  return filterSchemaResultsToAffected(merged, nestedAffected, data, skip);
}

/**
 * Runs the top-level-only path (unchanged `pick`/`omit` focus). `changed()`
 * runs additionally narrow synthesized failures by `skip()` — nested skip
 * names are no-ops in `omit()`, so the post-filter covers them. Plain runs
 * and empty changes pass through untouched.
 */
function runFlatSchema(
  schema: IntrospectableSchema,
  modifiers: { only?: unknown; skip?: unknown },
  data: unknown,
  changedAffected?: string[] | null,
): SchemaRunResult[] {
  // Top-level changed() runs carry dotted-blind `only` focus like the
  // nested path: a pick() would drop container validators chained after
  // construction, so they take the parity-guarded fallback schema instead.
  // Plain only()/skip() runs keep the legacy focus behavior identical.
  const focused = changedAffected
    ? changedFallbackSchema(schema, modifiers)
    : applySchemaFocus(schema, modifiers);
  const result = runExecutableSchema(focused, data);
  // Narrowing applies to n4s schemas only: custom standard-schema results
  // keep full-run parity (no affected/skip vocabulary exists for them).
  // Root-container n4s schemas (array/record/tuple roots without __schema)
  // cannot take pick/omit focus or projection, but their full-run failures
  // still filter by affected path — returning them unfiltered would report
  // failures changed() never asked about.
  if (
    changedAffected == null ||
    changedAffected.length === 0 ||
    !isN4sVendorSchema(schema)
  ) {
    return result;
  }
  const skip = buildSkipFilter(modifiers.skip);
  const memberResults = collectFlatMemberSupplement(
    schema,
    changedAffected,
    result,
    data,
    skip,
  );
  const merged = mergeSupplementalResults(result, memberResults);
  return filterSchemaResultsToAffected(merged, changedAffected, data, skip);
}

/**
 * Per-member execution for flat (top-level-only) changed() runs. The main
 * run validates the full schema, which reports only its first failure — an
 * affected member invalid behind an earlier failure would stay silent
 * (W2). n4s containers iterate schema keys in Object.keys order (ownKeys)
 * and short-circuit at the first failure, so members strictly after the
 * single reported failure's top key never executed: run exactly those
 * standalone and merge (W3 honors the merged only+affected set the same
 * way). Any other main outcome — pass, root failure, extra-key failure,
 * several failures — implies full member execution (or filter-kept roots),
 * so it supplements nothing: a member the main run reached is never
 * re-run, keeping stateful validators exactly-once.
 */
function collectFlatMemberSupplement(
  schema: IntrospectableSchema,
  affected: string[],
  main: SchemaRunResult[],
  data: unknown,
  skip: string[] | true | null,
): SchemaRunResult[] {
  if (skip === true) return [];
  const topSchema = schema.__schema;
  if (topSchema === undefined) return [];
  const afterKey = shadowedAfterKey(main, topSchema);
  if (afterKey === null) return [];
  // Absent-is-valid knowledge comes from the declared top container: a
  // partial-like top never evaluates missing keys, so an absent affected
  // member past the boundary is valid-absent, not a shadowed failure.
  const absentValid = isPartialLikeContainer(schema);
  return runShadowedMembers(topSchema, afterKey, {
    affected,
    absentValid,
    data,
    skip,
  });
}

type ShadowedRun = {
  readonly absentValid: boolean;
  readonly affected: string[];
  readonly skip: string[] | null;
  readonly data: unknown;
};

function runShadowedMembers(
  topSchema: Record<string, IntrospectableSchema>,
  afterKey: string,
  run: ShadowedRun,
): SchemaRunResult[] {
  const skipSet = skipSetOf(run.skip);
  const affectedSet = new Set(run.affected);
  const out: SchemaRunResult[] = [];
  let pastFailure = false;
  for (const key of Object.keys(topSchema)) {
    if (key === afterKey) {
      pastFailure = true;
    } else if (shouldRunShadowed(pastFailure, affectedSet, skipSet, key)) {
      appendFlatMember(
        topSchema[key],
        { absentValid: run.absentValid, data: run.data, key },
        out,
      );
    }
  }
  return out;
}

function shouldRunShadowed(
  pastFailure: boolean,
  affectedSet: Set<string>,
  skipSet: Set<string>,
  key: string,
): boolean {
  return pastFailure && affectedSet.has(key) && !skipSet.has(key);
}

/**
 * The top-level key a single-failure main run failed at, when that failure
 * proves later members never executed: exactly one failure, pathed under a
 * declared member. Anything else (pass, root failure, extra-key failure,
 * several failures) implies full member execution or filter-kept roots.
 */
function shadowedAfterKey(
  main: readonly SchemaRunResult[],
  topSchema: Record<string, IntrospectableSchema>,
): string | null {
  const failures = main.filter(result => !result.pass);
  if (failures.length !== 1) return null;
  return memberTopKey(failures, topSchema);
}

function memberTopKey(
  failures: SchemaRunResult[],
  topSchema: Record<string, IntrospectableSchema>,
): string | null {
  const [failure] = failures as [SchemaRunResult];
  const [top] = failure?.path ?? [];
  if (typeof top !== 'string' || !hasOwnProperty(topSchema, top)) return null;
  return top;
}

type FlatMemberRun = {
  readonly absentValid: boolean;
  readonly data: unknown;
  readonly key: string;
};

function appendFlatMember(
  rule: IntrospectableSchema,
  run: FlatMemberRun,
  out: SchemaRunResult[],
): void {
  // A member absent from a partial-like top was never evaluated by the main
  // run and is valid-absent: running it standalone would invent a failure
  // the full run never reports. Absent members of required containers are
  // genuinely invalid and run (failing correctly), as do present members —
  // including explicit-undefined ones, which the full run evaluates.
  if (skipAbsentMember(run)) return;
  const child = childValue(run.data, run.key);
  // This path is reached only when an earlier failure proved the member
  // was never executed.
  let outcome: SchemaRunResult[];
  try {
    outcome = runExecutableSchema(rule, child);
  } catch (error) {
    // A member with external dependencies cannot run standalone (orphaned
    // source): skip it — the main run's verdict stands, as before.
    if (isBoundaryError(error)) return;
    throw error;
  }
  for (const result of prefixFailureResults(outcome, [run.key])) {
    out.push(result);
  }
}

/**
 * Partial containers iterate own enumerable keys. Explicit undefined is
 * therefore provided only when its property participates in that iteration.
 */
function isPresentKey(data: unknown, key: string): boolean {
  return (
    isObject(data) && Object.prototype.propertyIsEnumerable.call(data, key)
  );
}

function skipAbsentMember(run: FlatMemberRun): boolean {
  return run.absentValid && !isPresentKey(run.data, run.key);
}

/**
 * One projected main run. `full` reports whether the main run already
 * executed the full schema instead of a fragment.
 */
type ProjectedMainRun = {
  results: SchemaRunResult[];
  full: boolean;
};

/**
 * Runs the projected fragment, falling back to the full schema run with
 * post-filtering when the fragment cannot validate standalone (e.g. an
 * exotic rooted edge the source expansion did not retain).
 */
function runProjectedOrFull(
  projectedSchema: IntrospectableSchema | null,
  schema: IntrospectableSchema,
  modifiers: { only?: unknown; skip?: unknown },
  data: unknown,
): ProjectedMainRun {
  if (!projectedSchema) {
    return {
      full: true,
      results: runExecutableSchema(
        changedFallbackSchema(schema, modifiers),
        data,
      ),
    };
  }
  try {
    return { full: false, results: runExecutableSchema(projectedSchema, data) };
  } catch (error) {
    if (!isBoundaryError(error)) throw error;
    return {
      full: true,
      results: runExecutableSchema(
        changedFallbackSchema(schema, modifiers),
        data,
      ),
    };
  }
}

/**
 * Schema for the changed() fallback path. The caller post-filters to the
 * affected set, so `only` focus (which carries dotted affected paths that
 * top-level pick() cannot express) must NOT narrow execution — a pick
 * would silently drop subtrees and container validators. Only top-level
 * `skip` focus applies, and only when rebuilding preserves behavior:
 * a partial-like top would gain requiredness and a moved chain would lose
 * container validators, so those run unfocused (post-filter narrows).
 */
function changedFallbackSchema(
  schema: IntrospectableSchema,
  modifiers: { only?: unknown; skip?: unknown },
): IntrospectableSchema {
  if (!isN4sSchema(schema)) return schema;
  if (isPartialLikeContainer(schema) || !chainBaselineMatches(schema)) {
    return schema;
  }
  return omitSkippedTopKeys(schema, modifiers.skip);
}

function omitSkippedTopKeys(
  schema: IntrospectableSchema,
  skipProp: unknown,
): IntrospectableSchema {
  const skip = buildArrayProp(skipProp);
  if (!skip || schema.__schema === undefined) return schema;
  // The interop view cannot name rule members; the values are the schema's
  // own member rules, so they satisfy the member constraint by construction.
  const members = schema.__schema as unknown as Record<
    string,
    SchemaMemberRule
  >;
  return preserveOptionality(schema, enforce.omit(members, skip));
}

/**
 * Runs a schema via parse-then-run, falling back to run(raw) when parse is
 * unavailable or reports an expected validation failure.
 */
function runExecutableSchema(
  executableSchema: IntrospectableSchema,
  data: unknown,
): SchemaRunResult[] {
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

/**
 * Detects standalone-boundary rejections. Name-checked instead of
 * instanceof: the error can originate from a second copy of the n4s classes
 * when the executable schema was built through the packaged entry point.
 */
function isBoundaryError(error: unknown): boolean {
  return (
    isObject(error) &&
    (error as { name?: unknown }).name === 'EnforceSchemaError'
  );
}

/**
 * Detects when a changed() affected set cannot be projected with a top-level
 * enforce.pick: a dotted/bracketed path (e.g. 'profile.state') would match
 * no top-level key. Returns the affected list when a full-schema run with
 * failure filtering is needed, null otherwise. Non-shape n4s roots also
 * return null (projection needs __schema); runFlatSchema filters those runs
 * by affected path instead of projecting them.
 */
function getNestedChangedAffected(
  schema: IntrospectableSchema,
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

type AffectedSeg = string | number;

/**
 * Bracket-to-dot parsing with numeric coercion. Keep in sync with
 * parseFieldName in changed.ts (same normalization, Number vs item-segment
 * output): the two parsers must agree on what 'travelers[1].country'
 * means, including the shared limitation that literal dotted record keys
 * are unrepresentable on both sides.
 */
function parseAffectedPath(field: string): AffectedSeg[] {
  return field
    .replace(/\[/g, '.')
    .replace(/\]/g, '')
    .split('.')
    .filter(Boolean)
    .map(part => (/^\d+$/.test(part) ? Number(part) : part));
}

/**
 * Structural view of a schema rule for projection introspection.
 * Symbol-keyed slots (ITEM_SCHEMA and friends) cross the package boundary
 * and cannot be named in public types, so they are read through SymbolSlots
 * at the single interop point below instead of leaking dynamic types.
 */
type IntrospectableSchema = {
  readonly __schema?: Record<string, IntrospectableSchema>;
  readonly describe?: () => DescribeResult;
  /**
   * Runtime validation entry points. Declared with method syntax (bivariant)
   * on purpose: every rule tests/runs/parses unknown values at runtime,
   * while each rule's declared input type is narrower. Used for behavioral
   * probing with probe-owned values and for executing projected fragments
   * — never to bypass argument checking.
   */
  test?(value: unknown): boolean;
  run?(...args: unknown[]): unknown;
  parse?(...args: unknown[]): unknown;
};

const partialLikeCache = new WeakMap<object, boolean>();

/**
 * Whether a shape-like container accepts a missing-everything value, i.e.
 * partial-style optionality. `__schema` carries only the key map — container
 * kind (shape/loose vs partial) is invisible — so kind is probed
 * behaviorally once per rule instance and cached. Unknown kinds retain the
 * original rule (full-run parity) instead of risking a rebuild.
 */
function isPartialLikeContainer(rule: IntrospectableSchema): boolean {
  if (typeof rule !== 'object' || rule === null) return false;
  // Construction-time knowledge wins: partial() marks itself, so an
  // all-optional shape is never mistaken for partial-like (P1-2). Rules
  // with a baseline were built by known combinators — an absent marker
  // means required semantics. Only exotic rules fall to the probe.
  if (symbolSlotOf(rule, PARTIAL_LIKE) === true) return true;
  if (hasChainBaseline(rule)) return false;
  return probePartialLikeCached(rule);
}

function probePartialLikeCached(rule: IntrospectableSchema): boolean {
  const cached = partialLikeCache.get(rule);
  if (cached !== undefined) return cached;
  const partialLike = probeEmptyAcceptance(rule);
  partialLikeCache.set(rule, partialLike);
  return partialLike;
}

function probeEmptyAcceptance(rule: IntrospectableSchema): boolean {
  const test = rule.test;
  if (test === undefined) return true;
  try {
    return test({}) === true;
  } catch {
    // A probe that throws reveals nothing — retain original semantics.
    return true;
  }
}

type SymbolSlots = Record<symbol, unknown>;

function symbolSlotOf(rule: unknown, slot: symbol): unknown {
  return (rule as unknown as SymbolSlots)[slot];
}

/**
 * Which container flavor owns the rule's item slot, if recorded.
 * Suffixes alone cannot distinguish records with numeric keys from
 * arrays — the kind travels with the slot from n4s instead.
 */
function containerKindOf(rule: IntrospectableSchema): ItemContainerKind | null {
  const kind = symbolSlotOf(rule, ITEM_CONTAINER);
  if (kind === 'array' || kind === 'record') {
    return kind;
  }
  return null;
}

/**
 * Whether the runtime value has the container flavor the rule declares.
 * Guards member dispatch when schema and data disagree on the container
 * type (e.g. array schema, object data): inventing member failures there
 * would attribute paths the full run never produced.
 */
function kindValueMatches(rule: IntrospectableSchema, value: unknown): boolean {
  const kind = containerKindOf(rule);
  if (kind === 'array') {
    return isArray(value);
  }
  if (kind === 'record') {
    return isRecordValue(value);
  }
  return true;
}

type MatchableDependency = {
  readonly target: string[];
  readonly sources: string[][];
};

/**
 * Expands the affected set with the dependency sources its targets need to
 * compose (local siblings, $.root providers). Without this, projecting to
 * the affected targets alone orphans their sources and the fragment throws
 * "depends on unknown field" at composition. Fixpoint so chains of retained
 * targets keep their own sources too. Never throws during introspection
 * failure the affected set passes through unchanged.
 */
export function expandAffectedWithSources(
  schema: IntrospectableSchema,
  affected: string[],
): string[] {
  const matchable = toMatchableDeps(getSchemaDependencies(schema));
  if (matchable.length === 0) return affected;
  const seen = new Set(affected);
  let frontier = [...affected];
  for (let round = 0; round < 10; round++) {
    if (frontier.length === 0) break;
    frontier = expandFrontier(frontier, matchable, seen);
  }
  return [...seen];
}

function expandFrontier(
  frontier: string[],
  deps: MatchableDependency[],
  seen: Set<string>,
): string[] {
  const next: string[] = [];
  for (const field of frontier) {
    collectSourceFields(field, deps, seen, next);
  }
  return next;
}

function collectSourceFields(
  field: string,
  deps: MatchableDependency[],
  seen: Set<string>,
  out: string[],
): void {
  const parsed = parseAffectedPath(field).map(String);
  for (const dep of deps) {
    if (segmentsMatch(parsed, dep.target)) {
      addDepSources(dep.sources, parsed, seen, out);
    }
  }
}

function addDepSources(
  sources: string[][],
  parsed: string[],
  seen: Set<string>,
  out: string[],
): void {
  for (const source of sources) {
    addConcretizedSource(concretizeSource(source, parsed), seen, out);
  }
}

function addConcretizedSource(
  field: string | null,
  seen: Set<string>,
  out: string[],
): void {
  if (!field || seen.has(field)) return;
  seen.add(field);
  out.push(field);
}

/**
 * Matches an affected path against a dependency target. Item segments ('*')
 * match a single segment; a match in either direction (equal, or either
 * side a parent path of the other) retains the sources, since validating a
 * parent runs its children and validating a child needs its parent scope.
 */
function segmentsMatch(affected: string[], target: string[]): boolean {
  const len = Math.min(affected.length, target.length);
  for (let i = 0; i < len; i++) {
    if (target[i] !== '*' && target[i] !== affected[i]) return false;
  }
  return true;
}

/**
 * Concretizes a dependency source path against the affected path that pulled
 * it in: item wildcards take the affected segment at the same position.
 * When the affected path is shorter (e.g. a whole-array change retaining an
 * item source), truncates to the longest concrete prefix so the whole branch
 * is retained instead of guessing an index.
 */
function concretizeSource(source: string[], affected: string[]): string | null {
  const out: string[] = [];
  for (let i = 0; i < source.length; i++) {
    if (!appendConcretizedSegment(source, affected, i, out)) break;
  }
  return out.length > 0 ? out.join('.') : null;
}

function appendConcretizedSegment(
  source: string[],
  affected: string[],
  index: number,
  out: string[],
): boolean {
  const seg = source[index];
  if (seg !== '*') {
    out.push(seg);
    return true;
  }
  // Fill a wildcard only when the source's concrete prefix matches the
  // affected path — otherwise an index from an unrelated array would leak
  // across (e.g. rows.4 into config.*). Truncating keeps the whole branch.
  if (!prefixesMatch(source, affected, index)) return false;
  const fill = affected[index];
  if (fill === undefined) return false;
  out.push(fill);
  return true;
}

function prefixesMatch(
  source: string[],
  affected: string[],
  upto: number,
): boolean {
  for (let i = 0; i < upto; i++) {
    const sourceSeg = source[i];
    const affectedSeg = affected[i];
    if (affectedSeg === undefined) return false;
    if (sourceSeg !== '*' && sourceSeg !== affectedSeg) return false;
  }
  return true;
}

function toMatchableDeps(deps: SchemaDependency[]): MatchableDependency[] {
  const out: MatchableDependency[] = [];
  for (const dep of deps) {
    const target = describeSegments(dep.target);
    if (target) out.push({ target, sources: collectSourceSegments(dep) });
  }
  return out;
}

function collectSourceSegments(dep: SchemaDependency): string[][] {
  const out: string[][] = [];
  for (const source of dep.sources) {
    const segs = describeSegments(source);
    if (segs) out.push(segs);
  }
  return out;
}

function describeSegments(path: SchemaPath): string[] | null {
  const out: string[] = [];
  for (const seg of path) {
    const str = describeSegment(seg);
    if (str === null) return null;
    out.push(str);
  }
  return out;
}

function describeSegment(seg: PropertySegment | ItemSegment): string | null {
  if (seg.type === 'item') return '*';
  return describePropertyKey(seg.key);
}

function describePropertyKey(key: PropertyKey): string | null {
  if (typeof key === 'string' || typeof key === 'number') {
    return String(key);
  }
  return null;
}

function getSchemaDependencies(
  schema: IntrospectableSchema,
): SchemaDependency[] {
  try {
    const describe = schema.describe;
    if (describe === undefined) return [];
    return describe().dependencies;
  } catch {
    // Introspection must never break a run: unprojectable schemas simply
    // keep their affected set unexpanded (the full-run fallback covers them).
    return [];
  }
}

/**
 * Per-member supplement for projection. Index-selected containers leave the
 * main fragment (which cannot express per-index selection), so the
 * supplement is their only execution: single-rule members run narrowed,
 * tuple members run positionally, union members resolve whole-member
 * matching with the full run's generic element failure. Containers report
 * only their first failure, so an unaffected member's failure can hide the
 * affected one after post-filtering (order-dependent, P1-3) — running each
 * affected member keeps every affected failure visible. Members the main
 * run already reported are not executed again (exactly-once, P1-4). The
 * main run stays authoritative for parsed data; these results only add
 * failures. A member that cannot run standalone (orphaned root edge) sets
 * the gap flag so the caller falls back to the full run instead of
 * silently omitting it.
 */
type ArraySupplement = {
  results: SchemaRunResult[];
  gap: boolean;
};

/**
 * Resolves the per-member supplement for a projected or full main run.
 * A full run can still stop at its first failing child, so selected members
 * beyond that boundary need supplementation. Members at or before the
 * boundary remain authoritative and are never executed again (F4).
 */
function collectSupplementForMain(
  mainRun: ProjectedMainRun,
  schema: IntrospectableSchema,
  expanded: string[],
  data: unknown,
): ArraySupplement {
  return collectArraySupplement(schema, expanded, data, mainRun);
}

function collectArraySupplement(
  schema: IntrospectableSchema,
  expanded: string[],
  data: unknown,
  mainRun: ProjectedMainRun,
): ArraySupplement {
  const gap = { found: false };
  try {
    return {
      results: collectArraySupplementInner(schema, data, {
        expanded,
        fullMain: mainRun.full,
        gap,
        main: mainRun.results,
      }),
      gap: gap.found,
    };
  } catch (error) {
    // Best-effort augmentation only: a member fragment that cannot even
    // project (e.g. an orphaned rooted edge at composition) must not break
    // the run — report the gap so the caller falls back to the full run.
    // Anything that is not a schema boundary failure stays loud.
    if (isBoundaryError(error)) return { results: [], gap: true };
    throw error;
  }
}

type ArraySupplementContext = {
  readonly expanded: string[];
  readonly fullMain: boolean;
  readonly gap: { found: boolean };
  readonly main: readonly SchemaRunResult[];
};

function collectArraySupplementInner(
  schema: IntrospectableSchema,
  data: unknown,
  context: ArraySupplementContext,
): SchemaRunResult[] {
  const topSchema = schema.__schema;
  if (topSchema === undefined || !isObject(data) || isArray(data)) return [];
  const out: SchemaRunResult[] = [];
  appendShapeDescendants(schema, data, {
    suffixes: context.expanded.map(parseAffectedPath),
    sink: {
      basePath: [],
      fullMain: context.fullMain,
      gap: context.gap,
      out,
    },
    main: context.main,
  });
  return out;
}

function childValue(data: unknown, top: string): unknown {
  if (!isObject(data)) return undefined;
  const record: Record<string, unknown> = data;
  if (!hasOwnProperty(record, top)) return undefined;
  return record[top];
}

type IndexRunSink = {
  readonly basePath: string[];
  out: SchemaRunResult[];
  /** Boundary gaps hit while running members standalone (→ full fallback). */
  readonly gap: { found: boolean };
  /** Whether the authoritative main result came from the unprojected schema. */
  readonly fullMain: boolean;
};

type IndexSelection = {
  readonly suffixes: AffectedSeg[][];
  readonly sink: IndexRunSink;
  /** Main-run failures: covered members must not execute again (P1-4). */
  readonly main: readonly SchemaRunResult[];
};

function appendSupplementalFailures(
  rule: IntrospectableSchema,
  value: unknown,
  selection: IndexSelection,
): void {
  if (tryAppendMembers(rule, value, selection)) return;
  if (isArray(value) || !isObject(value)) return;
  const record: Record<string, unknown> = value;
  appendShapeDescendants(rule, record, selection);
}

function tryAppendMembers(
  rule: IntrospectableSchema,
  value: unknown,
  selection: IndexSelection,
): boolean {
  const dispatch = memberDispatch(rule);
  if (dispatch === null) return false;
  // The container itself failed after either rejecting its input or running
  // a chained predicate. Its main result is authoritative for this path.
  if (mainFailedAtPath(selection.main, selection.sink.basePath)) return true;
  if (dispatch.kind === 'tuple') {
    return appendTupleMembers(rule, dispatch.members, value, selection);
  }
  if (dispatch.kind === 'union') {
    return appendUnionMembers(rule, dispatch.members, value, selection);
  }
  return appendSingleDispatch(rule, dispatch.item, value, selection);
}

function appendSingleDispatch(
  rule: IntrospectableSchema,
  item: IntrospectableSchema,
  value: unknown,
  selection: IndexSelection,
): boolean {
  if (!kindValueMatches(rule, value)) {
    // Schema/data container contradiction: the full run reports the
    // container's own failure here, not member failures. Reproduce it
    // exactly with a standalone container run (merge dedupes when the main
    // run already reported it).
    appendContainerFailure(rule, value, selection);
    return true;
  }
  if (mainExecutedWholeContainer(rule, selection)) {
    // The main run executed every member of this kept-whole container with
    // no failure under it: re-running affected members here would
    // double-execute stateful validators (F3). Members the main run never
    // reached (short-circuit shadowing) still run below (P1-3).
    return true;
  }
  if (isArray(value)) {
    return appendEachIndex(item, value, selection);
  }
  if (isRecordValue(value)) {
    return appendRecordKeys(rule, item, value, selection);
  }
  return false;
}

/**
 * Reproduces a container-level failure exactly (length contracts,
 * non-array data): runs the container rule itself and attributes failures
 * to the container path, mirroring the full run.
 */
function appendContainerFailure(
  rule: IntrospectableSchema,
  value: unknown,
  selection: IndexSelection,
): void {
  for (const result of prefixFailureResults(
    safeRunItem(rule, value, selection.sink),
    selection.sink.basePath,
  )) {
    selection.sink.out.push(result);
  }
}

/**
 * Whether the main run already reports a failure at or under the member
 * path. Covered members must not execute again: rerunning stateful
 * validators would change results (P1-4). The main outcome is authoritative.
 */
function isCoveredByMain(
  main: readonly SchemaRunResult[],
  memberPath: string[],
): boolean {
  return main.some(result => {
    if (result.pass) return false;
    const path = result.path ?? [];
    if (path.length < memberPath.length) return false;
    return memberPath.every((seg, i) => String(path[i]) === seg);
  });
}

function isRecordValue(value: unknown): value is Record<string, unknown> {
  return isObject(value) && !isArray(value);
}

/**
 * Whether the main run already executed every member of this container:
 * the projection kept it whole and reported no failure at or under its
 * path. A kept-whole run short-circuits at the first failure, so any
 * failure under the container means later members may never have run —
 * those still need their supplement run (P1-3 shadowing).
 */
function mainExecutedWholeContainer(
  rule: IntrospectableSchema,
  selection: IndexSelection,
): boolean {
  if (isCoveredByMain(selection.main, selection.sink.basePath)) return false;
  return projectionKeptWhole(rule, selection.suffixes);
}

/**
 * Mirrors the projection's fragment fate for one container: kept-whole
 * (the same rule back, or null which callers also keep) means the main run
 * executed it. Never throws — an undecidable container keeps the
 * established per-member behavior.
 */
function projectionKeptWhole(
  rule: IntrospectableSchema,
  suffixes: AffectedSeg[][],
): boolean {
  try {
    const outcome = projectRule(rule, suffixes);
    return outcome === null || outcome === rule;
  } catch {
    return false;
  }
}

function appendEachIndex(
  item: IntrospectableSchema,
  value: readonly unknown[],
  selection: IndexSelection,
): boolean {
  const indices = indexHeads(selection.suffixes);
  for (const index of indices) {
    if (mainVisitedArrayIndex(index, selection)) continue;
    appendSingleIndex(item, value, index, selection);
  }
  return indices.length > 0;
}

function appendRecordKeys(
  rule: IntrospectableSchema,
  item: IntrospectableSchema,
  value: Record<string, unknown>,
  selection: IndexSelection,
): boolean {
  const keys = keyHeads(selection.suffixes);
  for (const key of keys) {
    if (mainVisitedRecordKey(value, key, selection)) continue;
    appendRecordKey({ item, key, rule, value }, selection);
  }
  return keys.length > 0;
}

type RecordKeyRun = {
  readonly rule: IntrospectableSchema;
  readonly item: IntrospectableSchema;
  readonly value: Record<string, unknown>;
  readonly key: string;
};

function appendRecordKey(entry: RecordKeyRun, selection: IndexSelection): void {
  if (shouldRunRecordEntry(entry, selection)) {
    runRecordKeyEntry(entry, selection);
    return;
  }
  appendSingleKey(entry.item, entry.value, entry.key, selection);
}

/**
 * Whether an affected record key runs as a single-entry whole-record run
 * instead of the value-only flow. Only genuine records qualify (the
 * closed-over rule carries the two-arg key rule no slot exposes), only
 * safe keys (a computed `{[__proto__]: …}` entry would set a prototype
 * instead of an own key), and only exact-key selections (deeper paths keep
 * the narrowed value flow, which the entry run cannot reproduce).
 */
function shouldRunRecordEntry(
  entry: RecordKeyRun,
  selection: IndexSelection,
): boolean {
  return (
    containerKindOf(entry.rule) === 'record' &&
    !isUnsafeKey(entry.key) &&
    isExactKeySelection(selection.suffixes, entry.key)
  );
}

function isExactKeySelection(suffixes: AffectedSeg[][], key: string): boolean {
  const rests = suffixesForMember(suffixes, key);
  return rests.length > 0 && rests.every(rest => rest.length === 0);
}

/**
 * Evaluates one affected record key with the record's own rule against a
 * single-entry object, so a two-arg key rule violation on the affected key
 * surfaces instead of hiding behind first-failure ordering (the supplement
 * otherwise runs only the value rule). Entry evaluation is independent per
 * key in n4s, and attribution matches the value flow: the record prefixes
 * the key, the merger prefixes the container path. Replaces (never adds
 * to) the value-only run, so stateful validators still fire exactly once.
 */
function runRecordKeyEntry(
  entry: RecordKeyRun,
  selection: IndexSelection,
): void {
  if (!hasOwnProperty(entry.value, entry.key)) return;
  const child = entry.value[entry.key];
  const memberPath = [...selection.sink.basePath, entry.key];
  // Exactly-once like the value flow: a main-run failure here is already
  // reported — rerunning would double-execute stateful validators.
  if (isCoveredByMain(selection.main, memberPath)) return;
  const outcome = safeRunItem(
    entry.rule,
    { [entry.key]: child },
    selection.sink,
  );
  pushRecordEntryResults(outcome, entry.key, selection.sink);
}

function pushRecordEntryResults(
  outcome: SchemaRunResult[],
  key: string,
  sink: IndexRunSink,
): void {
  for (const result of prefixFailureResults(outcome, sink.basePath)) {
    if (!result.pass) {
      sink.out.push(result);
      continue;
    }
    pushRecordEntryPass(result, key, sink);
  }
}

/**
 * Unwraps a passing single-entry result to its entry value so the F5
 * coercion fold places the coerced value (not the single-entry object) at
 * the member path. Entries the key rule renamed have no affected-path
 * home, so they contribute no patch — the fragment keeps its raw value.
 */
function pushRecordEntryPass(
  result: SchemaRunResult,
  key: string,
  sink: IndexRunSink,
): void {
  const entryValue = recordEntryValue(result.type, key);
  if (entryValue === undefined) {
    sink.out.push({ pass: result.pass, path: result.path });
    return;
  }
  sink.out.push({ ...result, type: entryValue });
}

function recordEntryValue(type: unknown, key: string): unknown {
  if (!isObject(type)) return undefined;
  const parsed = type as Record<string, unknown>;
  if (!hasOwnProperty(parsed, key)) return undefined;
  return parsed[key];
}

function appendShapeDescendants(
  rule: IntrospectableSchema,
  value: Record<string, unknown>,
  selection: IndexSelection,
): void {
  const context = shapeDescendantContext(rule, selection);
  if (context === null) return;
  const keys = Object.keys(context.inner);
  const failedIndex =
    context.failedKey === null ? -1 : keys.indexOf(context.failedKey);
  for (let index = 0; index < keys.length; index += 1) {
    appendSelectedShapeDescendant({
      context,
      failedIndex,
      index,
      key: keys[index],
      selection,
      value,
    });
  }
}

type ShapeDescendantContext = {
  readonly absentValid: boolean;
  readonly byKey: Map<string, AffectedSeg[][]>;
  readonly failedKey: string | null;
  readonly inner: Record<string, IntrospectableSchema>;
};

function shapeDescendantContext(
  rule: IntrospectableSchema,
  selection: IndexSelection,
): ShapeDescendantContext | null {
  const inner = rule.__schema;
  if (inner === undefined) return null;
  const byKey = groupAffectedByChildKey(inner, selection.suffixes);
  if (byKey === null) return null;
  // An object-container failure at this exact path comes from a predicate
  // chained after the shape evaluator; every child already ran successfully.
  if (mainFailedAtPath(selection.main, selection.sink.basePath)) return null;
  const failedKey = failedChildKey(inner, selection);
  // A full main run already executed every reachable member. Supplement it
  // only when its single failure identifies a short-circuit boundary.
  if (fullMainWithoutFailureBoundary(selection, failedKey)) return null;
  // Absent-is-valid knowledge for shadowed members: a partial-like parent
  // never evaluates missing keys, so an absent member past the boundary is
  // valid-absent, not a shadowed failure.
  return { absentValid: isPartialLikeContainer(rule), byKey, failedKey, inner };
}

function fullMainWithoutFailureBoundary(
  selection: IndexSelection,
  failedKey: string | null,
): boolean {
  return selection.sink.fullMain && failedKey === null;
}

type ShapeDescendantRun = {
  readonly context: ShapeDescendantContext;
  readonly failedIndex: number;
  readonly index: number;
  readonly key: string;
  readonly selection: IndexSelection;
  readonly value: Record<string, unknown>;
};

function appendSelectedShapeDescendant(run: ShapeDescendantRun): void {
  const { context, failedIndex, index, key, selection, value } = run;
  const rests = context.byKey.get(key);
  if (rests === undefined) return;
  if (memberPrecedesFailure(index, failedIndex)) return;
  const childSelection: IndexSelection = {
    suffixes: rests,
    sink: {
      basePath: [...selection.sink.basePath, key],
      fullMain: selection.sink.fullMain,
      gap: selection.sink.gap,
      out: selection.sink.out,
    },
    main: selection.main,
  };
  if (memberFollowsFailure(index, failedIndex)) {
    if (isAbsentPartialMember(context, value, key)) return;
    appendShadowedShapeMember(context.inner[key], value, key, childSelection);
    return;
  }
  appendSupplementalFailures(context.inner[key], value[key], childSelection);
}

/**
 * A member absent from a partial-like parent was never evaluated by the
 * main run and is valid-absent: running it standalone would invent a
 * failure the full run never reports. Present members — including
 * explicit-undefined ones, which container iteration evaluates — always
 * run, as do absent members of required containers (genuinely invalid).
 */
function isAbsentPartialMember(
  context: ShapeDescendantContext,
  value: Record<string, unknown>,
  key: string,
): boolean {
  return context.absentValid && !isPresentKey(value, key);
}

function memberPrecedesFailure(index: number, failedIndex: number): boolean {
  return failedIndex >= 0 && index < failedIndex;
}

function memberFollowsFailure(index: number, failedIndex: number): boolean {
  return failedIndex >= 0 && index > failedIndex;
}

function mainFailedAtPath(
  main: readonly SchemaRunResult[],
  path: readonly string[],
): boolean {
  const failures = main.filter(result => !result.pass);
  if (failures.length !== 1) return false;
  const failurePath = failures[0].path ?? [];
  return (
    failurePath.length === path.length &&
    path.every((segment, index) => String(failurePath[index]) === segment)
  );
}

/**
 * Returns the immediate child whose failure stopped this shape, when the
 * main run proves that later siblings were never executed. Failure paths are
 * already rebased to the root, so the current sink path locates the relevant
 * segment at any nesting depth.
 */
function failedChildKey(
  inner: Record<string, IntrospectableSchema>,
  selection: IndexSelection,
): string | null {
  const key = failedDescendantHead(selection);
  if (key === null) return null;
  return hasOwnProperty(inner, key) ? key : null;
}

function failedDescendantHead(selection: IndexSelection): string | null {
  const failures = selection.main.filter(result => !result.pass);
  if (failures.length !== 1) return null;
  const path = failures[0].path ?? [];
  const base = selection.sink.basePath;
  if (path.length <= base.length) return null;
  if (!base.every((segment, index) => String(path[index]) === segment)) {
    return null;
  }
  return String(path[base.length]);
}

/** Members through the failing array position were already visited. */
function mainVisitedArrayIndex(
  index: number,
  selection: IndexSelection,
): boolean {
  const head = failedDescendantHead(selection);
  if (head === null || !/^(0|[1-9]\d*)$/.test(head)) return false;
  const failedIndex = Number(head);
  return Number.isSafeInteger(failedIndex) && index <= failedIndex;
}

/** Record iteration follows own-key order and stops at its failing entry. */
function mainVisitedRecordKey(
  value: Record<string, unknown>,
  key: string,
  selection: IndexSelection,
): boolean {
  const failedKey = failedDescendantHead(selection);
  if (failedKey === null) return false;
  const keys = Object.keys(value);
  const failedIndex = keys.indexOf(failedKey);
  const selectedIndex = keys.indexOf(key);
  return failedIndex >= 0 && selectedIndex >= 0 && selectedIndex <= failedIndex;
}

/**
 * Runs one selected shape member that lies strictly after the main run's
 * first failing sibling. This is not a duplicate: n4s shape containers stop
 * at that sibling. Nested projected containers and coercions use the same
 * member path as array supplementation.
 */
function appendShadowedShapeMember(
  rule: IntrospectableSchema,
  value: Record<string, unknown>,
  key: string,
  selection: IndexSelection,
): void {
  const child = hasOwnProperty(value, key) ? value[key] : undefined;
  const narrowed = projectRule(rule, selection.suffixes);
  // This member is now its own projected run. Descendant supplementation
  // must reason from that local outcome, not the earlier full-root failure.
  const sink: IndexRunSink = { ...selection.sink, fullMain: false };
  if (narrowed === FRAGMENT_EXCLUDED) {
    tryAppendMembers(rule, child, { ...selection, sink });
    return;
  }
  runProjectedMember(narrowed ?? rule, child, selection.suffixes, sink);
}

type MemberDispatch =
  | { kind: 'single'; item: IntrospectableSchema }
  | { kind: 'tuple'; members: IntrospectableSchema[] }
  | { kind: 'union'; members: IntrospectableSchema[] };

/**
 * Classifies a rule's item slot for per-member execution. Tuples carry a
 * positional member list under a kindless slot; unions carry their member
 * list under kind 'array'; records and single-rule arrays carry one member.
 */
function memberDispatch(rule: IntrospectableSchema): MemberDispatch | null {
  const slot = symbolSlotOf(rule, ITEM_SCHEMA);
  if (isArray(slot)) {
    const members = asMemberRules(slot);
    if (members.length === 0) return null;
    if (containerKindOf(rule) === 'array') {
      return { kind: 'union', members };
    }
    return { kind: 'tuple', members };
  }
  if (!isObject(slot)) return null;
  return { kind: 'single', item: slot as unknown as IntrospectableSchema };
}

function asMemberRules(slot: readonly unknown[]): IntrospectableSchema[] {
  const members: IntrospectableSchema[] = [];
  for (const entry of slot) {
    if (isObject(entry)) {
      members.push(entry as unknown as IntrospectableSchema);
    }
  }
  return members;
}

/**
 * Tuple members run positionally: member i validates element i with the
 * same index-prefixed attribution the full run produces, so an affected
 * member's failure surfaces even when an earlier member failed first
 * (P1-3). Length mismatches reproduce the full run's container-level
 * failure instead — positions are meaningless without a valid length.
 */
function appendTupleMembers(
  rule: IntrospectableSchema,
  members: IntrospectableSchema[],
  value: unknown,
  selection: IndexSelection,
): boolean {
  if (!isArray(value)) {
    appendContainerFailure(rule, value, selection);
    return true;
  }
  if (!tupleLengthOk(members, value)) {
    appendContainerFailure(rule, value, selection);
    return true;
  }
  return appendTupleIndices(rule, members, value, selection);
}

function appendTupleIndices(
  rule: IntrospectableSchema,
  members: IntrospectableSchema[],
  value: readonly unknown[],
  selection: IndexSelection,
): boolean {
  const indices = indexHeads(selection.suffixes);
  for (const index of indices) {
    if (mainVisitedArrayIndex(index, selection)) continue;
    if (index >= value.length) continue;
    const member = members[index];
    if (member === undefined) {
      // Unknown flavor (a union read as positional): reproduce the
      // container's own verdict exactly instead of inventing attribution.
      appendContainerFailure(rule, value, selection);
      break;
    }
    appendSingleIndex(member, value, index, selection);
  }
  return indices.length > 0;
}

/**
 * The tuple length contract holds exactly when no required position is
 * missing: every position past the value end must be optional-marked.
 * Markers (not behavioral probes) decide — introspection executes nothing.
 */
function tupleLengthOk(
  members: readonly IntrospectableSchema[],
  value: readonly unknown[],
): boolean {
  if (value.length > members.length) return false;
  for (let i = value.length; i < members.length; i += 1) {
    if (symbolSlotOf(members[i], OPTIONAL_RULE) !== true) return false;
  }
  return true;
}

/**
 * Union members resolve whole-member matching: narrowing a member for the
 * verdict would admit elements the full run rejects. An element matching
 * no member reproduces the full run's generic element failure (P1-3).
 */
function appendUnionMembers(
  rule: IntrospectableSchema,
  members: IntrospectableSchema[],
  value: unknown,
  selection: IndexSelection,
): boolean {
  if (!isArray(value)) {
    appendContainerFailure(rule, value, selection);
    return true;
  }
  const indices = indexHeads(selection.suffixes);
  for (const index of indices) {
    if (mainVisitedArrayIndex(index, selection)) continue;
    appendUnionElement(members, value, index, selection);
  }
  return indices.length > 0;
}

function appendUnionElement(
  members: IntrospectableSchema[],
  value: readonly unknown[],
  index: number,
  selection: IndexSelection,
): void {
  if (index >= value.length) return;
  const child = value[index];
  const memberPath = [...selection.sink.basePath, String(index)];
  if (isCoveredByMain(selection.main, memberPath)) return;
  // Union membership is whole-member by semantics: narrowing a member for
  // the verdict would admit elements the full run rejects. An element
  // matching no member reproduces the full run's generic element failure.
  if (unionElementRejected(members, child, selection.sink)) {
    selection.sink.out.push({ pass: false, type: child, path: memberPath });
  }
}

function unionElementRejected(
  members: IntrospectableSchema[],
  child: unknown,
  sink: IndexRunSink,
): boolean {
  for (const member of members) {
    const results = safeRunItem(member, child, sink);
    if (results.every(result => result.pass)) {
      return false;
    }
  }
  return true;
}

function indexHeads(suffixes: AffectedSeg[][]): number[] {
  const indices = new Set<number>();
  for (const suffix of suffixes) {
    const head = suffix[0];
    if (typeof head === 'number') indices.add(head);
  }
  return [...indices];
}

function keyHeads(suffixes: AffectedSeg[][]): string[] {
  const keys = new Set<string>();
  for (const suffix of suffixes) {
    addKeyHead(suffix[0], keys);
  }
  return [...keys];
}

/**
 * Record keys are strings at runtime, but affected paths coerce numeric
 * segments to numbers (`parseAffectedPath`). Accept both spellings so
 * numeric record keys ('0', '1') dispatch to their member like other keys.
 */
function addKeyHead(head: AffectedSeg, keys: Set<string>): void {
  if (typeof head === 'string') {
    keys.add(head);
    return;
  }
  if (typeof head === 'number') {
    keys.add(String(head));
  }
}

function appendSingleIndex(
  item: IntrospectableSchema,
  value: readonly unknown[],
  index: number,
  selection: IndexSelection,
): void {
  // isArrayOf/tuple validate every position below length, including sparse
  // holes and explicit undefined values. Only an index beyond the runtime
  // array is absent and must be ignored.
  if (index >= value.length) return;
  appendSingleMember(item, value[index], selection, index);
}

function appendSingleKey(
  item: IntrospectableSchema,
  value: Record<string, unknown>,
  key: string,
  selection: IndexSelection,
): void {
  // Records validate own entries only. Preserve explicit undefined values;
  // unlike an absent key, record() would run its value rule for them.
  if (!hasOwnProperty(value, key)) return;
  appendSingleMember(item, value[key], selection, key);
}

function appendSingleMember(
  item: IntrospectableSchema,
  child: unknown,
  selection: IndexSelection,
  head: string | number,
): void {
  const memberPath = [...selection.sink.basePath, String(head)];
  // Exactly-once: the main run's outcome for this member is authoritative —
  // rerunning it would double-execute stateful validators (P1-4).
  if (isCoveredByMain(selection.main, memberPath)) return;
  const itemSuffixes = suffixesForMember(selection.suffixes, head);
  const narrowed = projectRule(item, itemSuffixes);
  const sink: IndexRunSink = {
    basePath: memberPath,
    fullMain: false,
    gap: selection.sink.gap,
    out: selection.sink.out,
  };
  if (narrowed === FRAGMENT_EXCLUDED) {
    // Nested index-selected container: descend into its own members instead
    // of running it whole (same selective-execution rule, one level down).
    tryAppendMembers(item, child, {
      suffixes: itemSuffixes,
      sink,
      main: selection.main,
    });
    return;
  }
  runProjectedMember(narrowed ?? item, child, itemSuffixes, sink);
}

function runProjectedMember(
  projected: IntrospectableSchema,
  child: unknown,
  itemSuffixes: AffectedSeg[][],
  sink: IndexRunSink,
): void {
  // No container-kind guard here: the member rule runs against the same
  // element the full run would reach (isArrayOf prefixes the member index
  // onto inner failures, so attribution already matches), and shadowed
  // members the full run never reaches are exactly what the supplement is
  // for. Contradicting container-vs-data dispatch is guarded one level up
  // in tryAppendMembers instead.
  const localResults = prefixFailureResults(
    safeRunItem(projected, child, sink),
    sink.basePath,
  );
  for (const result of localResults) {
    sink.out.push(result);
  }
  appendSupplementalFailures(projected, child, {
    suffixes: itemSuffixes,
    sink,
    main: localResults,
  });
}

function suffixesForMember(
  suffixes: AffectedSeg[][],
  head: string | number,
): AffectedSeg[][] {
  const out: AffectedSeg[][] = [];
  for (const suffix of suffixes) {
    if (headMatches(suffix[0], head)) out.push(suffix.slice(1));
  }
  return out;
}

/**
 * Matches a suffix head against a member key across the numeric coercion:
 * affected paths spell record key '1' as number 1, runtime data keeps '1'.
 */
function headMatches(suffixHead: AffectedSeg, head: string | number): boolean {
  if (suffixHead === head) return true;
  return (
    typeof head === 'string' &&
    typeof suffixHead === 'number' &&
    String(suffixHead) === head
  );
}

function safeRunItem(
  rule: IntrospectableSchema,
  value: unknown,
  sink: IndexRunSink,
): SchemaRunResult[] {
  try {
    return runExecutableSchema(rule, value);
  } catch (error) {
    // A standalone member run can orphan a $.root edge that only composes
    // in the full schema. Record the gap so the caller falls back to the
    // full run instead of silently omitting the affected member.
    if (isBoundaryError(error)) {
      sink.gap.found = true;
      return [];
    }
    throw error;
  }
}

/**
 * Re-bases supplement results to their member path. Failures carry the
 * verdict signal; passing entries are kept for their coerced `type` so the
 * merger can fold excluded-member coercions into the fragment's parsed
 * output (F5). Passing entries never become standalone results — the merger
 * folds their types into the main parsed value and drops them.
 */
function prefixFailureResults(
  results: SchemaRunResult[],
  path: string[],
): SchemaRunResult[] {
  const out: SchemaRunResult[] = [];
  for (const result of results) {
    out.push({ ...result, path: [...path, ...(result.path ?? [])] });
  }
  return out;
}

/**
 * Merges per-member supplement failures into the main run results,
 * skipping entries that duplicate a main-run failure. Keys stay
 * structured (path segments, never re-joined) so dotted record keys
 * cannot collide with nested paths during deduplication. Passing
 * supplement entries are not appended: their coerced types are folded
 * into the main parsed value instead (F5), so excluded members keep
 * full-run coercion parity on passing runs.
 */
export function mergeSupplementalResults(
  main: SchemaRunResult[],
  extra: SchemaRunResult[],
): SchemaRunResult[] {
  if (extra.length === 0) return main;
  const base = withSupplementCoercions(main, extra);
  const seen = new Set(base.map(resultKey));
  const out = [...base];
  appendUniqueFailures(out, seen, extra);
  return out;
}

function appendUniqueFailures(
  out: SchemaRunResult[],
  seen: Set<string>,
  extra: SchemaRunResult[],
): void {
  for (const result of extra) {
    if (result.pass) {
      continue;
    }
    const key = resultKey(result);
    if (!seen.has(key)) {
      seen.add(key);
      out.push(result);
    }
  }
}

type CoercionPatch = {
  readonly path: readonly string[];
  readonly value: unknown;
};

/**
 * Folds passing supplement member types (coerced values) into the main
 * parsed value. The fragment's pass-through output is a raw shallow copy,
 * so without this the excluded members would read uncoerced. Returns the
 * input untouched when no passing member carries a type.
 */
function withSupplementCoercions(
  main: SchemaRunResult[],
  extra: SchemaRunResult[],
): SchemaRunResult[] {
  const patches = coercionPatchesOf(extra);
  if (patches.length === 0) return main;
  const [first, ...rest] = main;
  if (isNullish(first)) return main;
  return [
    { ...first, type: applyCoercionPatches(first.type, patches) },
    ...rest,
  ];
}

function coercionPatchesOf(extra: SchemaRunResult[]): CoercionPatch[] {
  const patches: CoercionPatch[] = [];
  for (const result of extra) {
    if (isCoercionPatch(result)) {
      patches.push({ path: result.path, value: result.type });
    }
  }
  return patches;
}

/**
 * A passing member result placed at a concrete path, carrying its own
 * coerced type. Failing runs ignore parsed output (raw input fallback),
 * so only placement and type ownership matter here.
 */
function isCoercionPatch(
  result: SchemaRunResult,
): result is SchemaRunResult & { path: readonly string[] } {
  return (
    result.pass &&
    hasOwnProperty(result, 'type') &&
    !isNullish(result.path) &&
    result.path.length > 0
  );
}

function applyCoercionPatches(
  base: unknown,
  patches: CoercionPatch[],
): unknown {
  let out = base;
  for (const patch of patches) {
    out = setPathValue(out, patch.path, patch.value);
  }
  return out;
}

function setPathValue(
  base: unknown,
  path: readonly string[],
  value: unknown,
): unknown {
  const [head, ...tail] = path;
  if (isNullish(head)) return value;
  if (tail.length === 0) return setChildValue(base, head, value);
  return setChildValue(
    base,
    head,
    setPathValue(readChildValue(base, head), tail, value),
  );
}

function setChildValue(base: unknown, head: string, value: unknown): unknown {
  if (isArray(base)) {
    return isArrayIndex(head) ? setArrayChild(base, head, value) : base;
  }
  return setRecordChild(base, head, value);
}

function setArrayChild(
  base: unknown[],
  head: string,
  value: unknown,
): unknown[] {
  const out = [...base];
  out[Number(head)] = value;
  return out;
}

function setRecordChild(
  base: unknown,
  head: string,
  value: unknown,
): Record<string, unknown> {
  if (isObject(base)) {
    const record: Record<string, unknown> = base;
    return { ...record, [head]: value };
  }
  return { [head]: value };
}

function readChildValue(base: unknown, head: string): unknown {
  if (isArray(base) && isArrayIndex(head)) {
    return base[Number(head)];
  }
  if (!isObject(base)) {
    return undefined;
  }
  const record: Record<string, unknown> = base;
  if (!hasOwnProperty(record, head)) {
    return undefined;
  }
  return record[head];
}

function isArrayIndex(head: string): boolean {
  return /^\d+$/.test(head);
}

function resultKey(result: SchemaRunResult): string {
  // Paths stay structured (never re-joined) so dotted record keys cannot
  // collide with nested paths when deduplicating merged results.
  return `${result.pass}|${JSON.stringify(result.path ?? [])}|${result.message ?? ''}`;
}

/**
 * Builds a schema limited to the affected subtrees so unrelated validators
 * never execute during a nested changed() run. Top-level keys outside the
 * affected set are dropped; nested shape containers are rebuilt with only
 * the affected child keys; index-selected array/tuple/union containers
 * leave the fragment for the per-member supplement (which executes each
 * affected member exactly once), and a pass-through fragment is returned
 * when every affected subtree runs there. Returns null when nothing is
 * projectable, in which case the caller falls back to the full schema run
 * with post-filter.
 */
export function buildProjectedSchema(
  schema: IntrospectableSchema,
  affected: string[],
): IntrospectableSchema | null {
  try {
    return buildProjectedSchemaInner(schema, affected);
  } catch {
    // A fragment that cannot compose (e.g. a nested array rebuild orphaning
    // a source) is unprojectable — the caller falls back to the full run.
    return null;
  }
}

function buildProjectedSchemaInner(
  schema: IntrospectableSchema,
  affected: string[],
): IntrospectableSchema | null {
  const topSchema = introspectableTopSchema(schema);
  if (topSchema === null) return null;

  const byTop = groupAffectedByTopKey(topSchema, affected);
  if (byTop.size === 0) return null;

  const { projectedTop, excluded } = projectTopSchema(topSchema, byTop);
  if (Object.keys(projectedTop).length > 0) {
    const projected = projectedTopRule(schema, projectedTop);
    if (!projected) return null;
    return preserveOptionality(schema, projected);
  }
  return passThroughFragment(schema, excluded);
}

/**
 * The introspectable top-level shape, or null when the top container cannot
 * be rebuilt. Partial containers are representable as a loose shape whose
 * selected members are optional; a moved chain is not, because rebuilding
 * would lose its container validators.
 */
function introspectableTopSchema(
  schema: IntrospectableSchema,
): Record<string, IntrospectableSchema> | null {
  const topSchema = schema?.__schema;
  if (!topSchema || typeof topSchema !== 'object') return null;
  if (!topContainerRebuildable(schema)) return null;
  return topSchema;
}

function topContainerRebuildable(schema: IntrospectableSchema): boolean {
  return chainBaselineMatches(schema);
}

/**
 * Pass-through fragment for when every affected subtree runs in the
 * supplement: executes nothing but parses data through, so the main run
 * stays authoritative for parsed data without executing unaffected
 * validators (P1-4).
 */
function passThroughFragment(
  schema: IntrospectableSchema,
  excluded: number,
): IntrospectableSchema | null {
  if (excluded === 0) return null;
  try {
    return preserveOptionality(schema, looseRule({}));
  } catch {
    return null;
  }
}

function projectedTopRule(
  original: IntrospectableSchema,
  projectedTop: Record<string, IntrospectableSchema>,
): IntrospectableSchema | null {
  if (Object.keys(projectedTop).length === 0) return null;
  try {
    return rebuildShapeContainer(original, projectedTop);
  } catch {
    // Unprojectable fragment (e.g. an orphaned dependsOn source at the top
    // level): fall back to the full schema run with post-filter.
    return null;
  }
}

function groupAffectedByTopKey(
  topSchema: Record<string, IntrospectableSchema>,
  affected: string[],
): Map<string, AffectedSeg[][]> {
  const byTop = new Map<string, AffectedSeg[][]>();
  for (const field of affected) {
    appendTopGroup(byTop, topSchema, parseAffectedPath(field));
  }
  return byTop;
}

function appendTopGroup(
  byTop: Map<string, AffectedSeg[][]>,
  topSchema: Record<string, IntrospectableSchema>,
  segs: AffectedSeg[],
): void {
  if (segs.length === 0) return;
  const [top, ...rest] = segs as [AffectedSeg, ...AffectedSeg[]];
  if (typeof top !== 'string') return;
  // Unknown keys stay grouped: the fragment retains them as extra-key
  // sentinels so a strict shape() failure the full run reports is not lost.
  // Unsafe unknown keys are still dropped: a sentinel cannot sit in a
  // plain-object fragment (prototype setter instead of an own key).
  if (isUnsafeUnknownKey(topSchema, top)) return;
  const list = byTop.get(top) ?? [];
  list.push(rest);
  byTop.set(top, list);
}

function isUnsafeUnknownKey(
  topSchema: Record<string, IntrospectableSchema>,
  key: string,
): boolean {
  return !hasOwnProperty(topSchema, key) && isUnsafeKey(key);
}

/**
 * projectRule outcome for containers the per-member supplement executes
 * instead of the fragment (arrays/tuples/unions with index selections):
 * executing them in the main run would run unaffected members and run
 * affected members twice (P1-4). Callers drop the key; the supplement
 * covers exactly the selected members.
 */
const FRAGMENT_EXCLUDED: unique symbol = Symbol('vest:fragmentExcluded');

function projectTopSchema(
  topSchema: Record<string, IntrospectableSchema>,
  byTop: Map<string, AffectedSeg[][]>,
): {
  projectedTop: Record<string, IntrospectableSchema>;
  excluded: number;
} {
  const projectedTop: Record<string, IntrospectableSchema> = {};
  let excluded = 0;
  for (const top of Object.keys(topSchema)) {
    const outcome = projectTopKey(topSchema[top], byTop.get(top));
    if (outcome === FRAGMENT_EXCLUDED) {
      excluded += 1;
    } else if (outcome !== undefined) {
      projectedTop[top] = outcome;
    }
  }
  appendUnknownTopKeys(topSchema, byTop, projectedTop);
  return { projectedTop, excluded };
}

function appendUnknownTopKeys(
  topSchema: Record<string, IntrospectableSchema>,
  byTop: Map<string, AffectedSeg[][]>,
  projectedTop: Record<string, IntrospectableSchema>,
): void {
  for (const top of byTop.keys()) {
    if (!hasOwnProperty(topSchema, top)) {
      projectedTop[top] = unknownExtraKeyRule();
    }
  }
}

/**
 * Sentinel for an affected key the schema does not declare. It fails exactly
 * when the key is present (mirroring a strict shape() extra-key failure,
 * whose path is the key itself) and passes when the key is absent, so the
 * post-filter — not the fragment — keeps deciding affectedness. Known
 * blind spot: an explicitly undefined-valued extra key passes the sentinel
 * while a strict shape() fails it — value-only rules cannot distinguish
 * absent from undefined-valued.
 */
function unknownExtraKeyRule(): IntrospectableSchema {
  return enforce.condition((value: unknown) => value === undefined);
}

/**
 * One top-level key's fragment fate: undefined drops an unrelated key,
 * the rule keeps an exact-selected or un-narrowed subtree, and
 * FRAGMENT_EXCLUDED leaves supplement-covered containers out.
 */
function projectTopKey(
  rule: IntrospectableSchema,
  rests: AffectedSeg[][] | undefined,
): IntrospectableSchema | undefined | typeof FRAGMENT_EXCLUDED {
  // Unrelated top-level subtree: dropped so it cannot hide failures.
  if (rests === undefined) return undefined;
  // Exact-selected (e.g. parent changed path itself): keep whole subtree.
  if (rests.some(rest => rest.length === 0)) return rule;
  const projected = projectRule(rule, rests);
  return projected ?? rule;
}

/**
 * Narrows a nested rule to the given child suffixes. Returns the original
 * rule when nothing can (or needs to) be narrowed, null only when the shape
 * is not introspectable — both tell the caller to keep the original rule.
 * Returns FRAGMENT_EXCLUDED for containers the supplement executes instead
 * of the fragment — callers drop the key.
 */
function projectRule(
  rule: IntrospectableSchema,
  suffixes: AffectedSeg[][],
): IntrospectableSchema | null | typeof FRAGMENT_EXCLUDED {
  const inner = rule?.__schema;
  if (inner && typeof inner === 'object') {
    return projectShapeRule(rule, inner, suffixes);
  }
  return projectItemRule(rule, suffixes);
}

function projectItemRule(
  rule: IntrospectableSchema,
  suffixes: AffectedSeg[][],
): IntrospectableSchema | null | typeof FRAGMENT_EXCLUDED {
  // A moved chain means container-level validators a rebuild would drop —
  // retain the whole rule (full-run parity).
  if (!chainBaselineMatches(rule)) return rule;
  const itemSchema = symbolSlotOf(rule, ITEM_SCHEMA);
  if (isArray(itemSchema)) {
    // Tuple (positional members, kindless slot) and union (kind 'array')
    // members run per-index in the supplement with exact attribution
    // (P1-3). Index selections leave the fragment so unaffected members
    // never execute and affected members execute exactly once (P1-4);
    // anything else keeps the whole rule.
    return indexSelectionsOnly(suffixes) ? FRAGMENT_EXCLUDED : rule;
  }
  if (!isObject(itemSchema)) return null;
  return projectArrayRule(rule, suffixes);
}

/**
 * Whether every affected suffix selects specific members by index. Whole
 * selections (empty suffix) and non-index heads keep the container whole.
 */
function indexSelectionsOnly(suffixes: AffectedSeg[][]): boolean {
  return (
    suffixes.length > 0 &&
    suffixes.every(suffix => suffix.length > 0 && typeof suffix[0] === 'number')
  );
}

function projectShapeRule(
  rule: IntrospectableSchema,
  inner: Record<string, IntrospectableSchema>,
  suffixes: AffectedSeg[][],
): IntrospectableSchema | null {
  const byKey = groupAffectedByChildKey(inner, suffixes);
  if (!byKey || byKey.size === 0) return null;

  const filtered = projectShapeChildren(inner, byKey);
  if (isUnchangedShape(inner, filtered)) return rule;
  return rebuildShapeRule(rule, filtered);
}

/**
 * Rebuilds a narrowed shape fragment. Partial semantics are represented by
 * optionalizing each retained member inside a loose container: missing
 * selected keys pass while unrelated original keys remain accepted. A moved
 * chain still cannot be rebuilt because its container validators are private
 * to the original rule.
 */
function rebuildShapeRule(
  rule: IntrospectableSchema,
  filtered: Record<string, IntrospectableSchema>,
): IntrospectableSchema | null {
  if (!chainBaselineMatches(rule)) return rule;
  try {
    return preserveOptionality(rule, rebuildShapeContainer(rule, filtered));
  } catch {
    // A narrowed fragment can orphan a dependsOn source (e.g. taxId needs
    // its sibling country): rebuilding then throws. Keep the whole subtree —
    // today's full-run behavior — instead of breaking the run.
    return rule;
  }
}

function projectShapeChildren(
  inner: Record<string, IntrospectableSchema>,
  byKey: Map<string, AffectedSeg[][]>,
): Record<string, IntrospectableSchema> {
  const filtered: Record<string, IntrospectableSchema> = {};
  for (const key of Object.keys(inner)) {
    const outcome = projectTopKey(inner[key], byKey.get(key));
    // Supplement-covered containers leave the fragment (P1-4). An emptied
    // shape still rebuilds as loose({}) below, keeping the key present so
    // parsed data keeps its structure.
    if (outcome === FRAGMENT_EXCLUDED) continue;
    if (outcome !== undefined) filtered[key] = outcome;
  }
  appendUnknownChildKeys(inner, byKey, filtered);
  return filtered;
}

function appendUnknownChildKeys(
  inner: Record<string, IntrospectableSchema>,
  byKey: Map<string, AffectedSeg[][]>,
  filtered: Record<string, IntrospectableSchema>,
): void {
  for (const key of byKey.keys()) {
    if (!hasOwnProperty(inner, key)) {
      filtered[key] = unknownExtraKeyRule();
    }
  }
}

function isUnchangedShape(
  inner: Record<string, IntrospectableSchema>,
  filtered: Record<string, IntrospectableSchema>,
): boolean {
  const filteredKeys = Object.keys(filtered);
  return (
    filteredKeys.length === Object.keys(inner).length &&
    filteredKeys.every(key => filtered[key] === inner[key])
  );
}

function groupAffectedByChildKey(
  inner: Record<string, IntrospectableSchema>,
  suffixes: AffectedSeg[][],
): Map<string, AffectedSeg[][]> | null {
  const byKey = new Map<string, AffectedSeg[][]>();
  for (const suffix of suffixes) {
    if (!appendChildGroup(byKey, inner, suffix)) return null;
  }
  return byKey;
}

function appendChildGroup(
  byKey: Map<string, AffectedSeg[][]>,
  inner: Record<string, IntrospectableSchema>,
  suffix: AffectedSeg[],
): boolean {
  const [head, ...rest] = suffix as [AffectedSeg, ...AffectedSeg[]];
  if (typeof head !== 'string') return false;
  // Unknown keys stay grouped so nested fragments retain their extra-key
  // sentinels. Unsafe ones keep the whole rule instead: a sentinel cannot
  // sit in a plain-object fragment (prototype setter, not an own key).
  if (!hasOwnProperty(inner, head) && isUnsafeKey(head)) return false;
  const list = byKey.get(head) ?? [];
  list.push(rest);
  byKey.set(head, list);
  return true;
}

/**
 * Decides an array rule's fragment fate. Per-index selections leave the
 * fragment (FRAGMENT_EXCLUDED): isArrayOf validates every member with one
 * rule, so keeping it would execute unaffected members, and the per-member
 * supplement already executes each affected member exactly once (P1-4).
 * Records always keep the full rule: narrowing through record() would drop
 * a two-arg record's key rule (n4s exposes only the value rule in the item
 * slot), breaking parity with the full run. Whole-item and non-index
 * selections keep the container whole. Member failures still surface via
 * the per-member supplement.
 */
type LooseCombinator = (
  schema: Record<string, IntrospectableSchema>,
) => IntrospectableSchema;

const looseRule = enforce.loose as LooseCombinator;

type OptionalCombinator = (inner: IntrospectableSchema) => IntrospectableSchema;

const optionalRule = enforce.optional as OptionalCombinator;

function rebuildShapeContainer(
  original: IntrospectableSchema,
  filtered: Record<string, IntrospectableSchema>,
): IntrospectableSchema {
  return looseRule(
    isPartialLikeContainer(original) ? optionalizeMembers(filtered) : filtered,
  );
}

function optionalizeMembers(
  members: Record<string, IntrospectableSchema>,
): Record<string, IntrospectableSchema> {
  const optionalized: Record<string, IntrospectableSchema> = {};
  for (const key of Object.keys(members)) {
    optionalized[key] = optionalRule(members[key]);
  }
  return optionalized;
}

function projectArrayRule(
  rule: IntrospectableSchema,
  suffixes: AffectedSeg[][],
): IntrospectableSchema | null | typeof FRAGMENT_EXCLUDED {
  if (containerKindOf(rule) === 'record') return rule;
  if (!indexSelectionsOnly(suffixes)) return rule;
  return FRAGMENT_EXCLUDED;
}

/**
 * Preserves optional-wrapped containers across projection: a rebuilt loose
 * rule would fail on nullish values that the original optional rule passes.
 */
function preserveOptionality(
  original: IntrospectableSchema,
  rebuilt: IntrospectableSchema,
): IntrospectableSchema {
  if (!isNullishPassing(original)) return rebuilt;
  return optionalRule(rebuilt);
}

function isNullishPassing(rule: IntrospectableSchema): boolean {
  // optional() marks itself: no behavioral probe (which would execute user
  // validators with synthetic nullish values during introspection).
  if (symbolSlotOf(rule, OPTIONAL_RULE) === true) return true;
  if (hasChainBaseline(rule)) return false;
  return probeNullishPassing(rule);
}

function probeNullishPassing(rule: IntrospectableSchema): boolean {
  const test = rule?.test;
  if (typeof test !== 'function') return false;
  try {
    return test(undefined) || test(null);
  } catch {
    // Probing must never break projection; use the rebuilt rule as-is.
    return false;
  }
}

/**
 * Narrows full-schema run results to failures under the affected changed paths.
 * Passing entries are preserved; root failures (no path) are kept since they
 * affect every field. A failure is kept on exact match or when either side is
 * a parent path of the other (affected 'profile' keeps failures at
 * 'profile.state', and a failure at 'profile' is relevant to 'profile.state').
 */
export function filterSchemaResultsToAffected(
  results: SchemaRunResult[],
  affected: string[],
  data: unknown,
  skip: string[] | true | null = null,
): SchemaRunResult[] {
  if (skip === true) {
    // Boolean skip-all (skip(true)): every synthesized failure is skipped,
    // mirroring the runtime which skips all tests — including the
    // schema-failure tests. Same pass-through as the empty-kept path.
    return passThroughResult(results, data);
  }
  const affectedSet = new Set(affected.map(normalizeFieldName));
  const skipSet = skipSetOf(skip);
  const kept = results.filter(result =>
    keepSchemaResult(result, affectedSet, skipSet),
  );
  return keptOrPassThrough(kept, results, data);
}

function keptOrPassThrough(
  kept: SchemaRunResult[],
  results: SchemaRunResult[],
  data: unknown,
): SchemaRunResult[] {
  if (kept.length > 0) {
    return kept;
  }
  return passThroughResult(results, data);
}

function passThroughResult(
  results: SchemaRunResult[],
  data: unknown,
): SchemaRunResult[] {
  return [{ pass: true, type: results[0]?.type ?? data }];
}

function skipSetOf(skip: string[] | null): Set<string> {
  // Raw entries only: the runtime matches skip() against user-test names
  // exactly (no normalization), so normalizing here would drop synthesized
  // failures the full run still reports (nested skips are no-ops in
  // omit()). Canonicalization stays on the affected-matching side only.
  return new Set(skip ?? []);
}

function keepSchemaResult(
  result: SchemaRunResult,
  affectedSet: Set<string>,
  skipSet: Set<string>,
): boolean {
  return !isSkippedName(result, skipSet) && isAffectedName(result, affectedSet);
}

/**
 * Skip matching mirrors the runtime exactly: suite `skip()` applies to
 * user tests by exact field name, so synthesized failures drop only on
 * exact raw match — `skip('items[0]')` does not suppress a dotted
 * 'items.0' synthesis, exactly as it would not skip a test named
 * 'items.0'. Pathless failures are never skipped (they read as global).
 */
function isSkippedName(result: SchemaRunResult, skipSet: Set<string>): boolean {
  if (result.pass || skipSet.size === 0) {
    return false;
  }
  const failureName = (result.path ?? []).map(String).join('.');
  if (!failureName) {
    return false;
  }
  return skipSet.has(failureName);
}

/**
 * Affected matching keeps string semantics (exact or parent either way):
 * both sides already speak dotted strings, so numeric coercions compare
 * equal and dotted record keys keep the historical keep-behavior rather
 * than going silently clean. Dedupe collisions for dotted keys are handled
 * separately via structured result keys.
 */
function isAffectedName(
  result: SchemaRunResult,
  affectedSet: Set<string>,
): boolean {
  if (result.pass) {
    return true;
  }
  const failureName = (result.path ?? []).map(String).join('.');
  if (!failureName) {
    return true;
  }
  return affectedSetHas(affectedSet, failureName);
}

function affectedSetHas(
  affectedSet: Set<string>,
  failureName: string,
): boolean {
  for (const name of affectedSet) {
    if (name === failureName || isEitherPrefix(name, failureName)) {
      return true;
    }
  }
  return false;
}

function isEitherPrefix(first: string, second: string): boolean {
  return first.startsWith(`${second}.`) || second.startsWith(`${first}.`);
}

const N4S_VENDOR = 'n4s';

/**
 * Any n4s-produced rule (shape-rooted or a root container): failure paths
 * from these runs speak the affected-path vocabulary, so post-filtering by
 * affected/skip applies. Custom standard-schema results do not.
 */
function isN4sVendorSchema(schema: unknown): boolean {
  if (!isObject(schema)) return false;
  return schema['~standard']?.vendor === N4S_VENDOR;
}

/**
 * Shape-rooted n4s schemas only. pick/omit focus and fragment projection
 * both traverse __schema top-level keys, so root containers (array/record
 * roots) run unfocused and filter afterward instead.
 */
function isN4sSchema(schema: any): boolean {
  return isN4sVendorSchema(schema) && !!schema?.__schema;
}

function applySchemaFocus(
  schema: any,
  modifiers: { only?: unknown; skip?: unknown },
): any {
  // Root-container n4s schemas run unfocused here (pick/omit need __schema
  // keys); runFlatSchema still narrows their failures by affected path.
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
  // Non-string entries never reach name matching: asArray(true) is [true]
  // and normalizeFieldName would throw on it (boolean skip-all is a legal
  // modifier, handled as match-all by buildSkipFilter instead).
  return asArray(prop).filter(
    (entry): entry is string => typeof entry === 'string',
  );
}

/**
 * Skip filter for synthesized failures. Boolean skip-all (skip(true))
 * drops every failure, mirroring the runtime which skips all tests;
 * name lists narrow by exact field name via buildArrayProp.
 */
function buildSkipFilter(skipProp: unknown): string[] | true | null {
  if (skipProp === true) return true;
  return buildArrayProp(skipProp);
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

function shouldRunSchema(schema: unknown): schema is IntrospectableSchema {
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
