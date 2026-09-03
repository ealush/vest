import { enforce, ITEM_CONTAINER, ITEM_SCHEMA } from 'n4s';
import type {
  DescribeResult,
  ItemContainerKind,
  ItemSegment,
  PropertySegment,
  SchemaDependency,
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

import { getAffectedFields, normalizeFieldName } from './changed';
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
  const result = runProjectedOrFull(projectedSchema, schema, modifiers, data);
  const merged = mergeSupplementalResults(
    result,
    collectArraySupplement(schema, expanded, data),
  );
  // `only` is already merged into the affected set by the caller; `skip`
  // must additionally narrow synthesized failures (the projected run does
  // not take focused modifiers, unlike `applySchemaFocus`).
  const skip = buildArrayProp(modifiers.skip);
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
  const result = runExecutableSchema(applySchemaFocus(schema, modifiers), data);
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
  return filterSchemaResultsToAffected(
    result,
    changedAffected,
    data,
    buildArrayProp(modifiers.skip),
  );
}

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
): SchemaRunResult[] {
  if (!projectedSchema) {
    return runExecutableSchema(applySchemaFocus(schema, modifiers), data);
  }
  try {
    return runExecutableSchema(projectedSchema, data);
  } catch (error) {
    if (!isBoundaryError(error)) throw error;
    return runExecutableSchema(applySchemaFocus(schema, modifiers), data);
  }
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
 * enforce.pick: any dotted/bracketed path (e.g. 'profile.state') would match
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
 * at the single interop point below instead of leaking `any`.
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

function symbolSlotOf(rule: IntrospectableSchema, slot: symbol): unknown {
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
 * targets keep their own sources too. Never throws: on any introspection
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
 * match any single segment; a match in either direction (equal, or either
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
 * Per-member supplement for projection. Container rules (`isArrayOf`,
 * `record`) validate every member with one rule and report only the first
 * failing member, so a union projection can report an unaffected member
 * whose failure the post-filter then drops — hiding the real affected
 * failure (order-dependent). Running the projected member rule against
 * each affected index/key, descending through nested shapes, and merging
 * the failures keeps every affected member visible. The main run stays
 * authoritative for parsed data; these results only add failures.
 */
function collectArraySupplement(
  schema: IntrospectableSchema,
  expanded: string[],
  data: unknown,
): SchemaRunResult[] {
  try {
    return collectArraySupplementInner(schema, expanded, data);
  } catch (error) {
    // Best-effort augmentation only: a member fragment that cannot even
    // project (e.g. an orphaned rooted edge at composition) must not break
    // the run — the main run and its fallback still cover it. Anything that
    // is not a schema boundary failure stays loud.
    if (isBoundaryError(error)) return [];
    throw error;
  }
}

function collectArraySupplementInner(
  schema: IntrospectableSchema,
  expanded: string[],
  data: unknown,
): SchemaRunResult[] {
  const topSchema = schema.__schema;
  if (topSchema === undefined) return [];
  const byTop = groupAffectedByTopKey(topSchema, expanded);
  const out: SchemaRunResult[] = [];
  for (const top of Object.keys(topSchema)) {
    const rests = byTop.get(top);
    if (rests === undefined) continue;
    appendSupplementalFailures(topSchema[top], childValue(data, top), {
      suffixes: rests,
      sink: { basePath: [top], out },
    });
  }
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
};

type IndexSelection = {
  readonly suffixes: AffectedSeg[][];
  readonly sink: IndexRunSink;
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
  const item = singleItemSchema(rule);
  if (item === null) return false;
  if (!kindValueMatches(rule, value)) return false;
  if (isArray(value)) {
    return appendEachIndex(item, value, selection);
  }
  if (isRecordValue(value)) {
    return appendEachKey(item, value, selection);
  }
  return false;
}

function isRecordValue(value: unknown): value is Record<string, unknown> {
  return isObject(value) && !isArray(value);
}

function appendEachIndex(
  item: IntrospectableSchema,
  value: readonly unknown[],
  selection: IndexSelection,
): boolean {
  const indices = indexHeads(selection.suffixes);
  for (const index of indices) {
    appendSingleIndex(item, value, index, selection);
  }
  return indices.length > 0;
}

function appendEachKey(
  item: IntrospectableSchema,
  value: Record<string, unknown>,
  selection: IndexSelection,
): boolean {
  const keys = keyHeads(selection.suffixes);
  for (const key of keys) {
    appendSingleKey(item, value, key, selection);
  }
  return keys.length > 0;
}

function appendShapeDescendants(
  rule: IntrospectableSchema,
  value: Record<string, unknown>,
  selection: IndexSelection,
): void {
  const inner = rule.__schema;
  if (inner === undefined) return;
  const byKey = groupAffectedByChildKey(inner, selection.suffixes);
  if (byKey === null) return;
  for (const key of Object.keys(inner)) {
    const rests = byKey.get(key);
    if (rests === undefined) continue;
    appendSupplementalFailures(inner[key], value[key], {
      suffixes: rests,
      sink: {
        basePath: [...selection.sink.basePath, key],
        out: selection.sink.out,
      },
    });
  }
}

function singleItemSchema(
  rule: IntrospectableSchema,
): IntrospectableSchema | null {
  const item = symbolSlotOf(rule, ITEM_SCHEMA);
  // Tuples and multi-rule arrays carry a list of element schemas, which a
  // single item run cannot express — the main run covers those.
  if (!isObject(item) || isArray(item)) return null;
  return item as IntrospectableSchema;
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
 * numeric record keys ('0', '1') dispatch to their member like any key.
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
  appendSingleMember(item, value[index], selection, index);
}

function appendSingleKey(
  item: IntrospectableSchema,
  value: Record<string, unknown>,
  key: string,
  selection: IndexSelection,
): void {
  appendSingleMember(item, value[key], selection, key);
}

function appendSingleMember(
  item: IntrospectableSchema,
  child: unknown,
  selection: IndexSelection,
  head: string | number,
): void {
  if (child === undefined) return;
  const itemSuffixes = suffixesForMember(selection.suffixes, head);
  const narrowed = projectRule(item, itemSuffixes);
  const projected: IntrospectableSchema = narrowed ?? item;
  const sink: IndexRunSink = {
    basePath: [...selection.sink.basePath, String(head)],
    out: selection.sink.out,
  };
  // No container-kind guard here: the member rule runs against the same
  // element the full run would reach (isArrayOf prefixes the member index
  // onto inner failures, so attribution already matches), and shadowed
  // members the full run never reaches are exactly what the supplement is
  // for. Contradicting container-vs-data dispatch is guarded one level up
  // in tryAppendMembers instead.
  for (const result of prefixFailureResults(
    safeRunItem(projected, child),
    sink.basePath,
  )) {
    sink.out.push(result);
  }
  appendSupplementalFailures(projected, child, {
    suffixes: itemSuffixes,
    sink,
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
): SchemaRunResult[] {
  try {
    return runExecutableSchema(rule, value);
  } catch (error) {
    // A standalone item run can orphan a $.root edge that only composes in
    // the full schema; skip the supplement then (the main run still covers
    // the index, and the full-run fallback covers composition gaps).
    if (isBoundaryError(error)) return [];
    throw error;
  }
}

/**
 * Re-bases supplement results to their member path, keeping failures only.
 * Passing entries carry no signal (the main run owns parsed data and pass
 * state), so they are dropped to keep the merged set meaningful.
 */
function prefixFailureResults(
  results: SchemaRunResult[],
  path: string[],
): SchemaRunResult[] {
  const out: SchemaRunResult[] = [];
  for (const result of results) {
    if (!result.pass) {
      out.push({ ...result, path: [...path, ...(result.path ?? [])] });
    }
  }
  return out;
}

export function mergeSupplementalResults(
  main: SchemaRunResult[],
  extra: SchemaRunResult[],
): SchemaRunResult[] {
  if (extra.length === 0) return main;
  const seen = new Set(main.map(resultKey));
  const out = [...main];
  for (const result of extra) {
    const key = resultKey(result);
    if (!seen.has(key)) {
      seen.add(key);
      out.push(result);
    }
  }
  return out;
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
 * the affected child keys; array items are narrowed by the union of affected
 * suffixes across indices. Returns null when nothing is projectable, in
 * which case the caller falls back to the full schema run with post-filter.
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
  const topSchema = schema?.__schema;
  if (!topSchema || typeof topSchema !== 'object') return null;

  const byTop = groupAffectedByTopKey(topSchema, affected);
  if (byTop.size === 0) return null;

  return looseProjectedTop(projectTopSchema(topSchema, byTop));
}

function looseProjectedTop(
  projectedTop: Record<string, IntrospectableSchema>,
): IntrospectableSchema | null {
  if (Object.keys(projectedTop).length === 0) return null;
  try {
    return looseRule(projectedTop);
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
  if (!hasOwnProperty(topSchema, top)) return;
  const list = byTop.get(top) ?? [];
  list.push(rest);
  byTop.set(top, list);
}

function projectTopSchema(
  topSchema: Record<string, IntrospectableSchema>,
  byTop: Map<string, AffectedSeg[][]>,
): Record<string, IntrospectableSchema> {
  const projectedTop: Record<string, IntrospectableSchema> = {};
  for (const top of Object.keys(topSchema)) {
    const rests = byTop.get(top);
    // Unrelated top-level subtree: excluded so it cannot hide failures.
    if (!rests) continue;
    if (rests.some(rest => rest.length === 0)) {
      // Exact-selected (e.g. parent changed path itself): keep whole subtree.
      projectedTop[top] = topSchema[top];
      continue;
    }
    projectedTop[top] = projectRule(topSchema[top], rests) ?? topSchema[top];
  }
  return projectedTop;
}

/**
 * Narrows a nested rule to the given child suffixes. Returns the original
 * rule when nothing can (or needs to) be narrowed, null only when the shape
 * is not introspectable — both tell the caller to keep the original rule.
 */
function projectRule(
  rule: IntrospectableSchema,
  suffixes: AffectedSeg[][],
): IntrospectableSchema | null {
  const inner = rule?.__schema;
  if (inner && typeof inner === 'object') {
    return projectShapeRule(rule, inner, suffixes);
  }
  return projectItemRule(rule, suffixes);
}

function projectItemRule(
  rule: IntrospectableSchema,
  suffixes: AffectedSeg[][],
): IntrospectableSchema | null {
  const itemSchema = symbolSlotOf(rule, ITEM_SCHEMA);
  // Tuple and multi-rule element lists cannot narrow to one rule — keep
  // the original (same outcome as before, stated directly).
  if (isArray(itemSchema)) return rule;
  if (!isObject(itemSchema)) return null;
  return projectArrayRule(rule, itemSchema, suffixes);
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
 * Rebuilds a narrowed shape fragment. Rebuilding as loose() is only valid
 * for required-semantics containers: a partial-like container would gain
 * requiredness (false positives), so the original rule is retained instead
 * — full-run parity via post-filtering.
 */
function rebuildShapeRule(
  rule: IntrospectableSchema,
  filtered: Record<string, IntrospectableSchema>,
): IntrospectableSchema | null {
  if (isPartialLikeContainer(rule)) return rule;
  try {
    return preserveOptionality(rule, looseRule(filtered));
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
    const rests = byKey.get(key);
    if (!rests) continue;
    if (rests.some(rest => rest.length === 0)) {
      filtered[key] = inner[key];
      continue;
    }
    filtered[key] = projectRule(inner[key], rests) ?? inner[key];
  }
  return filtered;
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
  if (!hasOwnProperty(inner, head)) return true;
  const list = byKey.get(head) ?? [];
  list.push(rest);
  byKey.set(head, list);
  return true;
}

/**
 * Narrows an array rule by projecting its item schema along the union of
 * affected suffixes across indices (per-index selection is not expressible
 * via isArrayOf, which validates every item with one rule). Whole-item
 * selections keep the original rule.
 */
/**
 * Array combinator viewed structurally: it accepts introspectable rules and
 * returns an introspectable rule. The cast sits at this single interop
 * boundary because the exposed combinator signature names the library's own
 * rule type, which callers outside n4s cannot construct precisely.
 */
type ArrayCombinator = (
  ...rules: IntrospectableSchema[]
) => IntrospectableSchema;

type LooseCombinator = (
  schema: Record<string, IntrospectableSchema>,
) => IntrospectableSchema;

const arrayOfRule = enforce.isArrayOf as ArrayCombinator;

const looseRule = enforce.loose as LooseCombinator;

type OptionalCombinator = (inner: IntrospectableSchema) => IntrospectableSchema;

const optionalRule = enforce.optional as OptionalCombinator;

function projectArrayRule(
  rule: IntrospectableSchema,
  itemSchema: IntrospectableSchema,
  suffixes: AffectedSeg[][],
): IntrospectableSchema | null {
  // Records keep the full rule: narrowing through record() would drop a
  // two-arg record's key rule (n4s exposes only the value rule in the item
  // slot), breaking parity with the full run. String member heads would
  // also trip hasWholeItemSelection below, so the kind check comes first
  // and states the parity reason directly. Member failures still surface
  // via the per-member supplement.
  if (containerKindOf(rule) === 'record') return rule;
  if (hasWholeItemSelection(suffixes)) return rule;
  const itemSuffixes = suffixes.map(suffix => suffix.slice(1));
  const projectedItem = projectRule(itemSchema, itemSuffixes);
  if (!projectedItem || projectedItem === itemSchema) return rule;
  return preserveOptionality(rule, arrayOfRule(projectedItem));
}

function hasWholeItemSelection(suffixes: AffectedSeg[][]): boolean {
  return suffixes.some(
    suffix =>
      suffix.length === 0 ||
      typeof suffix[0] !== 'number' ||
      suffix.slice(1).length === 0,
  );
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
  skip: string[] | null = null,
): SchemaRunResult[] {
  const affectedSet = new Set(affected.map(normalizeFieldName));
  const skipSet = skipSetOf(skip);
  const kept = results.filter(result =>
    keepSchemaResult(result, affectedSet, skipSet),
  );
  if (kept.length > 0) {
    return kept;
  }
  return [{ pass: true, type: results[0]?.type ?? data }];
}

function skipSetOf(skip: string[] | null): Set<string> {
  return new Set((skip ?? []).map(normalizeFieldName));
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
 * exact match. Pathless failures are never skipped (they read as global).
 * Both sides are bracket-normalized first ('items[0]' and 'items.0' denote
 * the same field), so spellings cannot disagree about what was skipped.
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
function isN4sVendorSchema(schema: any): boolean {
  return schema?.['~standard']?.vendor === N4S_VENDOR;
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
