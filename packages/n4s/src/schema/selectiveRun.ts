import {
  asArray,
  hasOwnProperty,
  isArray,
  isFunction,
  isNullish,
  isObject,
  isUnsafeKey,
} from 'vest-utils';

import { EnforceSchemaError } from '../errors/EnforceSchemaError';
import { enforceLazy } from '../lazy';
import type { SchemaMemberRule } from '../rules/schemaRules/schemaRulesLazyTypes';
import type { DescribeResult } from '../utils/RuleInstance';
import {
  ITEM_CONTAINER,
  ITEM_SCHEMA,
  OPTIONAL_RULE,
  PARTIAL_LIKE,
  chainBaselineMatches,
  hasChainBaseline,
} from './dependencyResolver';
import type { ItemContainerKind } from './dependencyResolver';
import type { ItemSegment, PropertySegment, SchemaPath } from './SchemaPath';
import { isPropertySegment } from './SchemaPath';
import { withSchemaExecutionProjection } from './projectionContext';
import type {
  SchemaDependency,
  SchemaRelationship,
} from './SchemaRelationship';

/**
 * Structural view of a schema rule for selective execution. Covers every
 * member the projection reads or rebuilds (`__schema` containers, item
 * slots, `describe()` dependencies, `run`/`parse` entry points).
 */
export type SelectiveSchema = {
  readonly __schema?: Record<string, SelectiveSchema>;
  readonly describe?: () => DescribeResult;
  /**
   * Runtime validation entry points. Declared with method syntax (bivariant)
   * on purpose: every rule tests/runs/parses unknown values at runtime,
   * while each rule's declared input type is narrower. Invoked only with
   * real run data when executing (projected or full) fragments — never
   * with synthetic values to infer schema semantics, and never to bypass
   * argument checking.
   */
  test?(value: unknown): boolean;
  run?(...args: unknown[]): unknown;
  parse?(...args: unknown[]): unknown;
};

/**
 * Outcome of one selective schema run. This is the canonical definition:
 * Vest's suite-side `SchemaRunResult` is a deliberate alias of this type
 * (see `useCreateSuiteRunner.ts`), so a schema failure means the same
 * shape on both sides of the boundary and stays comparable by structure.
 */
export type SelectiveSchemaResult = {
  readonly message?: string;
  readonly pass: boolean;
  readonly path?: readonly string[];
  readonly type?: unknown;
};

export type SelectiveRunOptions = {
  /**
   * Raw changed fields in canonical dotted form (e.g. 'travelers.1.country',
   * brackets accepted: 'travelers[1].country'); n4s expands them against
   * the schema relationship graph (dependents fan-out from run data plus
   * dependency-source retention), so callers pass raw names and never
   * pre-expand. Null or undefined runs the full schema with focus
   * narrowing only. An explicit empty array runs nothing (a single passing
   * entry carrying the input data).
   *
   * Paths are dotted strings, so a record key containing a literal dot is
   * unrepresentable ('a.b' always reads as nested path a → b). Numeric
   * segments always denote array indices in dotted form ('travelers.1' is
   * index 1, never record key '1'); an all-digit record key is
   * indistinguishable from an index and resolves as one.
   */
  readonly affected?: readonly string[] | null;
  /**
   * Inclusion focus: top-level field names (dotted names select subtrees).
   * Always intersects `affected` — `only` narrows execution, never widens
   * it and is never silently dropped. An explicit empty list runs nothing.
   */
  readonly only?: string | readonly string[] | null;
  /**
   * Exclusion focus: field names, or `true` for skip-all (every synthesized
   * failure is dropped, mirroring the suite runtime).
   */
  readonly skip?: string | readonly string[] | boolean | null;
};

/**
 * Normalized focus for the selective engine: `only` is already a name list
 * (null when no inclusion focus was given), `skip` keeps its raw form for
 * `buildSkipFilter` (boolean skip-all) and `buildArrayProp` (name lists).
 */
type FocusModifiers = {
  readonly only?: readonly string[] | null;
  readonly skip?: string | readonly string[] | boolean | null;
};

/**
 * The single contract for dependency-aware schema execution. The caller
 * passes raw changed fields; n4s owns everything after that: changed→
 * affected fan-out from the relationship graph (with array fan-out from
 * run data), container-kind detection, fragment projection, short-circuit
 * supplementation, chain-baseline checks, and failure narrowing. Returns
 * one entry per distinct failure (plus the parsed type on the first entry),
 * or a single passing entry carrying the parsed data. Throws
 * EnforceSchemaError on a nullish schema — schemaless runs never silently
 * pass here (the suite runner guards those before calling).
 */
export function runSchemaPaths(
  schema: unknown,
  data: unknown,
  options: SelectiveRunOptions = {},
): SelectiveSchemaResult[] {
  if (isNullish(schema)) {
    throw new EnforceSchemaError(
      'EnforceSchemaError: runSchemaPaths requires a schema',
    );
  }
  const focus = selectiveFocusOf({
    ...options,
    affected: expandChangedToAffected(schema, options.affected, data),
  });
  const execute = (): SelectiveSchemaResult[] =>
    runSchemaWithParse(
      schema as SelectiveSchema,
      data,
      { only: focus.onlyList, skip: focus.skip },
      focus.effectiveAffected,
    );
  return focus.effectiveAffected === null
    ? execute()
    : withSchemaExecutionProjection(execute);
}

/**
 * Normalizes entry-point options: `only` becomes a name list and the
 * affected set becomes the only∫affected intersection.
 */
function selectiveFocusOf(options: SelectiveRunOptions): {
  readonly effectiveAffected: readonly string[] | null;
  readonly onlyList: string[] | null;
  readonly skip: string | readonly string[] | boolean | null;
} {
  const { affected = null, only = null, skip = null } = options;
  const onlyList = buildArrayProp(only);
  return {
    effectiveAffected: intersectAffectedWithOnly(affected, onlyList),
    onlyList,
    skip,
  };
}

/**
 * Attempts to parse the schema. Returns null on genuine validation
 * failures, so the caller can fall back to schema.run.
 *
 * n4s rules expose the non-throwing StandardSchema `validate` entry, which
 * reports genuine failures as `issues` without throwing: validator bugs
 * (unexpected TypeErrors from user predicates or getters) propagate loudly
 * instead of being misclassified as validation failures. The throwing
 * `parse` entry — with the narrowed `isExpectedSchemaParseError` gate —
 * remains only for foreign `{ run, parse }` schemas without it.
 */
function tryParseSchema(
  executableSchema: SelectiveSchema,
  data: unknown,
): SelectiveSchemaResult[] | null {
  const parse = executableSchema.parse;
  if (!isFunction(parse)) return null;

  const standardValidate = n4sStandardValidateOf(executableSchema);
  if (standardValidate !== null) {
    return runViaStandardValidate(executableSchema, standardValidate, data);
  }
  return runViaThrowingParse(executableSchema, parse, data);
}

/**
 * n4s parse path: genuine failures arrive as `issues`, unexpected
 * exceptions propagate untouched.
 */
function runViaStandardValidate(
  executableSchema: SelectiveSchema,
  standardValidate: (data: unknown) => unknown,
  data: unknown,
): SelectiveSchemaResult[] | null {
  const result = standardValidate(data);
  if (hasStandardIssues(result)) return null;
  return runParsedValue(executableSchema, (result as { value: unknown }).value);
}

/**
 * Foreign `{ run, parse }` path: only validation-marked parse failures
 * fall back to `run`, programming errors stay loud.
 */
function runViaThrowingParse(
  executableSchema: SelectiveSchema,
  parse: (...args: unknown[]) => unknown,
  data: unknown,
): SelectiveSchemaResult[] | null {
  try {
    const parsedValue = parse(data);
    return runParsedValue(executableSchema, parsedValue);
  } catch (error) {
    if (isExpectedSchemaParseError(error)) return null;
    throw error;
  }
}

/**
 * The non-throwing StandardSchema validate entry of an n4s rule, or null
 * for foreign schemas (which keep the throwing parse path).
 */
function n4sStandardValidateOf(
  executableSchema: SelectiveSchema,
): ((data: unknown) => unknown) | null {
  if (!isN4sVendorSchema(executableSchema)) return null;
  const validate = (
    executableSchema as unknown as {
      '~standard'?: { validate?: unknown };
    }
  )['~standard']?.validate;
  return isFunction(validate) ? (validate as (data: unknown) => unknown) : null;
}

function hasStandardIssues(result: unknown): boolean {
  return (
    isObject(result) && Array.isArray((result as { issues?: unknown }).issues)
  );
}

/**
 * Runs a parsed value through the schema's run step when the schema opts
 * into parse-then-run; otherwise the parsed value is the result.
 */
function runParsedValue(
  executableSchema: SelectiveSchema,
  parsedValue: unknown,
): SelectiveSchemaResult[] {
  const run = executableSchema.run;
  if (shouldRunAfterParse(executableSchema) && isFunction(run)) {
    return normalizeSelectiveSchemaResult(run(parsedValue), parsedValue);
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
  schema: SelectiveSchema,
  data: unknown,
  modifiers: FocusModifiers,
  changedAffected?: readonly string[] | null,
): SelectiveSchemaResult[] {
  if (changedAffected == null) {
    return runFlatSchema(schema, modifiers, data, changedAffected);
  }
  if (changedAffected.length === 0) return [{ pass: true, type: data }];
  const divergentFallback = runExplicitUndefinedFallback(
    schema,
    modifiers,
    changedAffected,
    data,
  );
  if (divergentFallback !== null) return divergentFallback;
  const { mainRun, supplement } = runProjectedMain(
    schema,
    modifiers,
    [...changedAffected],
    data,
  );
  return narrowProjectedResults({
    data,
    mainRun,
    modifiers,
    nestedAffected: changedAffected,
    schema,
    supplement,
  });
}

type ProjectedOutcome = {
  readonly data: unknown;
  readonly mainRun: ProjectedMainRun;
  readonly modifiers: FocusModifiers;
  readonly nestedAffected: readonly string[];
  readonly schema: SelectiveSchema;
  readonly supplement: ArraySupplement;
};

/**
 * Narrows projected results to the affected set. `nestedAffected` already
 * carries the only∫affected intersection (see `intersectAffectedWithOnly`);
 * `skip` must additionally narrow synthesized failures (the projected run
 * does not take focused modifiers, unlike `applySchemaFocus`). A member
 * that cannot run standalone (orphaned root edge) would be silently
 * omitted — run everything with post-filtering instead.
 */
function narrowProjectedResults(
  outcome: ProjectedOutcome,
): SelectiveSchemaResult[] {
  const skip = buildSkipFilter(outcome.modifiers.skip);
  if (outcome.supplement.gap) {
    return runFullWithAffectedFilter({
      affected: outcome.nestedAffected,
      data: outcome.data,
      modifiers: outcome.modifiers,
      schema: outcome.schema,
      skip,
    });
  }
  const merged = mergeSupplementalResults(
    outcome.mainRun.results,
    outcome.supplement.results,
  );
  return filterSchemaResultsToAffected(
    merged,
    outcome.nestedAffected,
    outcome.data,
    skip,
  );
}

/**
 * One projected main run plus its per-member supplement.
 */
function runProjectedMain(
  schema: SelectiveSchema,
  modifiers: FocusModifiers,
  expanded: string[],
  data: unknown,
): { mainRun: ProjectedMainRun; supplement: ArraySupplement } {
  const projectedSchema = buildProjectedSchema(schema, expanded);
  const mainRun = runProjectedOrFull(projectedSchema, schema, modifiers, data);
  const supplement = collectSupplementForMain(mainRun, schema, expanded, data);
  return { mainRun, supplement };
}

type FullFilterRun = {
  readonly affected: readonly string[];
  readonly data: unknown;
  readonly modifiers: FocusModifiers;
  readonly schema: SelectiveSchema;
  readonly skip: string[] | true | null;
};

/**
 * Full-schema run with post-filtering to the affected set.
 */
function runFullWithAffectedFilter(
  run: FullFilterRun,
): SelectiveSchemaResult[] {
  const full = runExecutableSchema(
    changedFallbackSchema(run.schema, run.modifiers),
    run.data,
  );
  return filterSchemaResultsToAffected(full, run.affected, run.data, run.skip);
}

/**
 * Full-run fallback for the explicit-undefined unknown-key divergence (see
 * `hasExplicitUndefinedUnknownKey`): the fragment would report clean where
 * the full run fails, so run everything with post-filtering instead.
 * Returns null when the fast projection path applies.
 */
function runExplicitUndefinedFallback(
  schema: SelectiveSchema,
  modifiers: FocusModifiers,
  nestedAffected: readonly string[],
  data: unknown,
): SelectiveSchemaResult[] | null {
  if (!hasExplicitUndefinedProjectionDivergence(schema, nestedAffected, data)) {
    return null;
  }
  return runFlatSchema(schema, modifiers, data, nestedAffected);
}

/**
 * Runs the top-level-only path (unchanged `pick`/`omit` focus). `changed()`
 * runs additionally narrow synthesized failures by `skip()` — nested skip
 * names are no-ops in `omit()`, so the post-filter covers them. Plain runs
 * and empty changes pass through untouched.
 */
function runFlatSchema(
  schema: SelectiveSchema,
  modifiers: FocusModifiers,
  data: unknown,
  changedAffected?: readonly string[] | null,
): SelectiveSchemaResult[] {
  // Top-level changed() runs carry the only∫affected intersection like the
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
  if (!shouldNarrowFlatResults(schema, changedAffected)) {
    if (isEmptyAffectedFocus(schema, changedAffected)) {
      // Explicit zero-field focus (e.g. a disjoint only∫affected): run
      // nothing, mirroring the skip-all pass-through. Foreign schemas keep
      // full-run parity (no affected vocabulary exists for them).
      return passThroughResult(result, data);
    }
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
 * Whether flat changed() results narrow by affected path: a real affected
 * set on an n4s schema. Empty and foreign cases return early instead.
 */
function shouldNarrowFlatResults(
  schema: SelectiveSchema,
  changedAffected: readonly string[] | null | undefined,
): changedAffected is readonly string[] {
  return (
    changedAffected != null &&
    changedAffected.length > 0 &&
    isN4sVendorSchema(schema)
  );
}

function isEmptyAffectedFocus(
  schema: SelectiveSchema,
  changedAffected: readonly string[] | null | undefined,
): boolean {
  return changedAffected?.length === 0 && isN4sVendorSchema(schema);
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
  schema: SelectiveSchema,
  affected: readonly string[],
  main: SelectiveSchemaResult[],
  data: unknown,
  skip: string[] | true | null,
): SelectiveSchemaResult[] {
  if (skip === true) return [];
  const topSchema = schema.__schema;
  if (topSchema === undefined) return [];
  const afterKey = shadowedAfterKey(main, topSchema);
  if (afterKey === null) return [];
  // Absent-member knowledge comes from the declared top container's
  // metadata: a partial-like top never evaluates missing keys, so an
  // absent affected member past the boundary is valid-absent, not a
  // shadowed failure. Unknown containers skip absent members too — the
  // full-run verdict stands instead of inventing failures.
  const skipAbsent = skipAbsentMembersOf(schema);
  return runShadowedMembers(topSchema, afterKey, {
    affected,
    data,
    skip,
    skipAbsent,
  });
}

type ShadowedRun = {
  readonly skipAbsent: boolean;
  readonly affected: readonly string[];
  readonly skip: string[] | null;
  readonly data: unknown;
};

function runShadowedMembers(
  topSchema: Record<string, SelectiveSchema>,
  afterKey: string,
  run: ShadowedRun,
): SelectiveSchemaResult[] {
  const skipSet = skipSetOf(run.skip);
  const affectedSet = new Set(run.affected);
  const out: SelectiveSchemaResult[] = [];
  let pastFailure = false;
  for (const key of Object.keys(topSchema)) {
    if (key === afterKey) {
      pastFailure = true;
    } else if (shouldRunShadowed(pastFailure, affectedSet, skipSet, key)) {
      appendFlatMember(
        topSchema[key],
        { skipAbsent: run.skipAbsent, data: run.data, key },
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
  main: readonly SelectiveSchemaResult[],
  topSchema: Record<string, SelectiveSchema>,
): string | null {
  const failures = main.filter(result => !result.pass);
  if (failures.length !== 1) return null;
  return memberTopKey(failures, topSchema);
}

function memberTopKey(
  failures: SelectiveSchemaResult[],
  topSchema: Record<string, SelectiveSchema>,
): string | null {
  const [failure] = failures as [SelectiveSchemaResult];
  const [top] = failure?.path ?? [];
  if (typeof top !== 'string' || !hasOwnProperty(topSchema, top)) return null;
  return top;
}

type FlatMemberRun = {
  readonly skipAbsent: boolean;
  readonly data: unknown;
  readonly key: string;
};

function appendFlatMember(
  rule: SelectiveSchema,
  run: FlatMemberRun,
  out: SelectiveSchemaResult[],
): void {
  // A member absent from a partial-like (or unknown) top was never
  // evaluated by the main run: running it standalone would invent a
  // failure the full run never reports. Absent members of required
  // containers are genuinely invalid and run (failing correctly), as do
  // present members — including explicit-undefined ones, which the full
  // run evaluates.
  if (skipAbsentMember(run)) return;
  const child = childValue(run.data, run.key);
  // This path is reached only when an earlier failure proved the member
  // was never executed.
  let outcome: SelectiveSchemaResult[];
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
  return run.skipAbsent && !isPresentKey(run.data, run.key);
}

/**
 * One projected main run. `full` reports whether the main run already
 * executed the full schema instead of a fragment.
 */
type ProjectedMainRun = {
  results: SelectiveSchemaResult[];
  full: boolean;
};

/**
 * Runs the projected fragment, falling back to the full schema run with
 * post-filtering when the fragment cannot validate standalone (e.g. an
 * exotic rooted edge the source expansion did not retain).
 */
function runProjectedOrFull(
  projectedSchema: SelectiveSchema | null,
  schema: SelectiveSchema,
  modifiers: FocusModifiers,
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
 * only∫affected set, so `only` needs no further narrowing here (a pick()
 * over dotted names would silently drop subtrees and container
 * validators). Only top-level `skip` focus applies, and only when
 * rebuilding preserves behavior: a partial-like top would gain
 * requiredness and a moved chain would lose container validators, so those
 * run unfocused (post-filter narrows).
 */
function changedFallbackSchema(
  schema: SelectiveSchema,
  modifiers: FocusModifiers,
): SelectiveSchema {
  if (!isN4sSchema(schema)) return schema;
  if (isPartialLikeContainer(schema) || !chainBaselineMatches(schema)) {
    return schema;
  }
  return omitSkippedTopKeys(schema, modifiers.skip);
}

function omitSkippedTopKeys(
  schema: SelectiveSchema,
  skipProp: string | readonly string[] | boolean | null | undefined,
): SelectiveSchema {
  const skip = buildArrayProp(skipProp);
  if (!skip || schema.__schema === undefined) return schema;
  // The interop view cannot name rule members; the values are the schema's
  // own member rules, so they satisfy the member constraint by construction.
  const members = schema.__schema as unknown as Record<
    string,
    SchemaMemberRule
  >;
  return preserveOptionality(
    schema,
    enforceLazy.omit(members, skip) as unknown as SelectiveSchema,
  );
}

/**
 * Runs a schema via parse-then-run, falling back to run(raw) when parse is
 * unavailable or reports an expected validation failure.
 */
function runExecutableSchema(
  executableSchema: SelectiveSchema,
  data: unknown,
): SelectiveSchemaResult[] {
  const parseResult = tryParseSchema(executableSchema, data);
  if (parseResult) {
    return parseResult;
  }
  if (isFunction(executableSchema.run)) {
    return normalizeSelectiveSchemaResult(executableSchema.run(data), data);
  }
  return [
    {
      pass: true,
      type: data,
    },
  ];
}

/**
 * Detects standalone-boundary rejections. instanceof-first for same-copy
 * errors, with an error-name fallback: the error can originate from a
 * second copy of the n4s classes when the executable schema was built
 * through the packaged entry point (dual-copy interop). Anything else —
 * including plain TypeErrors from buggy validators — is not a boundary.
 */
function isBoundaryError(error: unknown): boolean {
  if (error instanceof EnforceSchemaError) return true;
  return (
    isObject(error) &&
    (error as { name?: unknown }).name === 'EnforceSchemaError'
  );
}

type AffectedSeg = string | number;

/**
 * Canonical affected-path parser: the single implementation behind every
 * changed/affected field-name parse (n4s selective machinery and Vest's
 * suite.changed(), which delegates to this function). Bracket and dotted
 * spellings unify here ('travelers[1].country' and 'travelers.1.country'
 * parse identically); all-numeric segments become item segments (array
 * indices), everything else becomes a property segment. Shared limitation:
 * a literal dotted record key is unrepresentable ('a.b' always reads as
 * nested path a → b), and an all-digit record key is indistinguishable
 * from an array index.
 */
export function parseAffectedFieldName(field: string): SchemaPath {
  // Normalize brackets to dots: travelers[1].country -> travelers.1.country
  const normalized = field.replace(/\[/g, '.').replace(/\]/g, '');
  const parts = normalized.split('.').filter(Boolean);
  return parts.map((part): SchemaPath[number] =>
    // Numeric segments are item segments (array indices). A property
    // literally named '123' is ambiguous but unrepresentable here.
    /^\d+$/.test(part)
      ? { type: 'item', binding: part }
      : { type: 'property', key: part },
  ) as SchemaPath;
}

/**
 * Canonical dotted form of an affected field name ('travelers[1].country'
 * -> 'travelers.1.country').
 */
function canonicalAffectedName(field: string): string {
  return affectedPathToName(parseAffectedFieldName(field));
}

function affectedPathToName(path: SchemaPath): string {
  return path
    .map(seg => (seg.type === 'property' ? String(seg.key) : seg.binding))
    .join('.');
}

/**
 * Bracket-to-dot parsing with numeric coercion: the item-segment bindings
 * of the canonical parser read back as numbers for index dispatch.
 */
function parseAffectedPath(field: string): AffectedSeg[] {
  return parseAffectedFieldName(field).map(seg =>
    seg.type === 'item' ? Number(seg.binding) : String(seg.key),
  );
}

/**
 * Whether projection would change explicit-undefined semantics. This occurs
 * for unknown strict-shape keys (the value-only sentinel cannot distinguish
 * absence) and declared partial members (the projected optional wrapper would
 * skip a present undefined value that the full partial container evaluates).
 * Callers take the full-run fallback so the selective verdict stays exact.
 * Metadata-only: never executes user validators and never throws.
 */
function hasExplicitUndefinedProjectionDivergence(
  schema: SelectiveSchema,
  affected: readonly string[],
  data: unknown,
): boolean {
  for (const field of affected) {
    let path: AffectedSeg[];
    try {
      path = parseAffectedPath(field);
    } catch {
      continue;
    }
    if (checkAffectedSegments(schema, data, path, 0)) return true;
  }
  return false;
}

function checkAffectedSegments(
  schemaNode: SelectiveSchema | undefined,
  dataNode: unknown,
  segs: AffectedSeg[],
  index: number,
): boolean {
  if (index >= segs.length) return false;
  const next = stepAffectedSegment(
    schemaNode,
    dataNode,
    segs[index],
    index === segs.length - 1,
  );
  if (next === null) return false;
  if (next.diverged) return true;
  return checkAffectedSegments(next.schemaNode, next.dataNode, segs, index + 1);
}

type AffectedStep = {
  readonly diverged: boolean;
  readonly schemaNode: SelectiveSchema | undefined;
  readonly dataNode: unknown;
};

function stepAffectedSegment(
  schemaNode: SelectiveSchema | undefined,
  dataNode: unknown,
  seg: AffectedSeg | undefined,
  last: boolean,
): AffectedStep | null {
  if (typeof seg === 'number') {
    return stepIndexSegment(schemaNode, dataNode, seg);
  }
  return stepKeySegment(schemaNode, dataNode, seg, last);
}

function stepIndexSegment(
  schemaNode: SelectiveSchema | undefined,
  dataNode: unknown,
  index: number,
): AffectedStep | null {
  const member = itemMemberOf(schemaNode, index);
  if (member === undefined) return null;
  return {
    diverged: false,
    schemaNode: member,
    dataNode: isArray(dataNode) ? dataNode[index] : undefined,
  };
}

function stepKeySegment(
  schemaNode: SelectiveSchema | undefined,
  dataNode: unknown,
  seg: AffectedSeg | undefined,
  last: boolean,
): AffectedStep | null {
  if (typeof seg !== 'string' || schemaNode === undefined) return null;
  const inner = shapeInnerOf(schemaNode);
  if (inner === null) return null;
  if (!last) {
    return {
      diverged: false,
      schemaNode: inner[seg],
      dataNode: readDataKey(dataNode, seg),
    };
  }
  return finalKeyStep(schemaNode, inner, dataNode, seg);
}

function finalKeyStep(
  schemaNode: SelectiveSchema,
  inner: Record<string, SelectiveSchema>,
  dataNode: unknown,
  seg: string,
): AffectedStep {
  return {
    diverged:
      isDivergentUnknownKey(inner, dataNode, seg) ||
      (hasOwnProperty(inner, seg) &&
        isPartialLikeContainer(schemaNode) &&
        isExplicitUndefined(dataNode, seg)),
    schemaNode: undefined,
    dataNode: undefined,
  };
}

function isDivergentUnknownKey(
  inner: Record<string, SelectiveSchema>,
  dataNode: unknown,
  seg: string,
): boolean {
  return (
    !hasOwnProperty(inner, seg) &&
    !isUnsafeKey(seg) &&
    isExplicitUndefined(dataNode, seg)
  );
}

/**
 * The declared members of a shape-like container, or null when keys are
 * never unknown (records accept any key) or not introspectable.
 */
function shapeInnerOf(
  rule: SelectiveSchema,
): Record<string, SelectiveSchema> | null {
  // Records accept any key, so no key is ever unknown under one.
  if (containerKindOf(rule) === 'record') return null;
  const inner = rule.__schema;
  return inner && typeof inner === 'object' ? inner : null;
}

/**
 * Own-enumerable presence with an undefined value: exactly the case the
 * full run's own-keys iteration reports but the sentinel misses.
 * Non-enumerable keys are absent on both sides (ownKeys skips them).
 */
function isExplicitUndefined(dataNode: unknown, key: string): boolean {
  return (
    isObject(dataNode) &&
    Object.prototype.propertyIsEnumerable.call(dataNode, key) &&
    (dataNode as Record<string, unknown>)[key] === undefined
  );
}

function readDataKey(dataNode: unknown, key: string): unknown {
  if (!isObject(dataNode)) return undefined;
  return (dataNode as Record<string, unknown>)[key];
}

function itemMemberOf(
  rule: SelectiveSchema | undefined,
  index: number,
): SelectiveSchema | undefined {
  if (rule === undefined) return undefined;
  const slot = symbolSlotOf(rule, ITEM_SCHEMA);
  if (isArray(slot)) {
    const member = slot[index];
    return isObject(member)
      ? (member as unknown as SelectiveSchema)
      : undefined;
  }
  return isObject(slot) ? (slot as unknown as SelectiveSchema) : undefined;
}

/**
 * Invariant: no speculative execution of user validators in the changed()
 * path. Every projection decision below reads construction-time metadata
 * (PARTIAL_LIKE, OPTIONAL_RULE, chain baselines, container kinds). Rules
 * without recognizable metadata are never behaviorally probed: they take
 * the full-schema run + result filtering fallback instead.
 */

/**
 * Whether a shape-like container skips missing keys (partial-style
 * optionality). Metadata-only: partial() marks itself at construction, so
 * an all-optional shape is never mistaken for partial-like. Rules with a
 * chain baseline were built by known combinators — an absent marker means
 * required semantics.
 */
function isPartialLikeContainer(rule: SelectiveSchema): boolean {
  if (typeof rule !== 'object' || rule === null) return false;
  return symbolSlotOf(rule, PARTIAL_LIKE) === true;
}

/**
 * Whether absent members of a container must be skipped during
 * supplementation (never executed standalone). True for partial-like
 * containers (construction marker, above) and for unknown containers (no
 * marker and no chain baseline): the full run never evaluated the absent
 * member, and running it standalone could invent a failure the full run
 * never reports — the full-run verdict stands instead. Metadata-only, like
 * above: no user code executes to decide this.
 */
function skipAbsentMembersOf(rule: SelectiveSchema): boolean {
  if (typeof rule !== 'object' || rule === null) return false;
  if (symbolSlotOf(rule, PARTIAL_LIKE) === true) return true;
  return !hasChainBaseline(rule);
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
function containerKindOf(rule: SelectiveSchema): ItemContainerKind | null {
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
function kindValueMatches(rule: SelectiveSchema, value: unknown): boolean {
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
 * Dependency-source retention for an affected set: n4s owns the
 * relationship graph (via `describe()`), so expansion lives here. This
 * retains the sources affected targets need to compose (local siblings,
 * $.root providers). Without this, projecting to the affected targets
 * alone orphans their sources and the fragment throws "depends on unknown
 * field" at composition. Fixpoint so chains of retained targets keep
 * their own sources too. Never throws — during introspection failure the
 * affected set passes through unchanged. Runs after the forward
 * changed→affected fan-out (`expandChangedToAffected`); together they are
 * the single expansion of the run path.
 */
export function expandAffectedWithSources(
  schema: SelectiveSchema,
  affected: readonly string[],
): string[] {
  const matchable = toMatchableDeps(getSchemaDependencies(schema));
  if (matchable.length === 0) return [...affected];
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

/**
 * Forward changed→affected fan-out over the relationship graph. Together
 * with the source retention above this is the single expansion of the run
 * path: `runSchemaPaths` takes raw changed fields and expands here, so no
 * caller pre-expands (expanding twice would compose transitively and break
 * the pinned non-transitive contract — changed(a) runs a and b, not c).
 *
 * Direct dependents only (non-transitive), deduplicated, same-item for
 * arrays: a changed path matching a relationship source pulls the
 * relationship's targets, concretized with the changed index when
 * possible, fanned out from run data otherwise, falling back to the
 * top-level key when expansion is impossible (never '$item' bindings).
 * A parent-level changed path pulls targets the same way. Schemas without
 * graph data keep the changed names as-is. Never throws.
 */
function expandChangedToAffected(
  schema: unknown,
  affected: readonly string[] | null | undefined,
  data: unknown,
): readonly string[] | null {
  if (affected == null) return null;
  const changedArray = stringEntriesOf(affected);
  if (changedArray.length === 0) return [];
  const relationships = getSchemaRelationships(schema);
  if (relationships.length === 0) {
    return [...new Set(changedArray)];
  }
  return collectForwardTargets(changedArray, relationships, data);
}

// Non-string entries (e.g. a runtime boolean) never reach field-name
// parsing, which would throw on them — filtered gracefully instead.
function stringEntriesOf(entries: readonly unknown[]): string[] {
  return entries.filter((field): field is string => typeof field === 'string');
}

function collectForwardTargets(
  changedArray: string[],
  relationships: SchemaRelationship[],
  data: unknown,
): string[] {
  const concreteChanged = changedArray.map(field => ({
    field,
    path: parseAffectedFieldName(field),
  }));
  // Always include the changed fields themselves.
  const affectedSet = new Set<string>(changedArray);
  for (const rel of relationships) {
    addMatchingTargets(rel, concreteChanged, data, affectedSet);
  }
  return [...affectedSet];
}

function addMatchingTargets(
  rel: SchemaRelationship,
  concreteChanged: { field: string; path: SchemaPath }[],
  data: unknown,
  affectedSet: Set<string>,
): void {
  for (const { path: concretePath } of concreteChanged) {
    if (
      concreteMatchesPattern(rel.source, concretePath) ||
      isStrictPrefixOfPattern(rel.source, concretePath)
    ) {
      addConcreteTargets(rel, concretePath, data, affectedSet);
    }
  }
}

function getSchemaRelationships(schema: unknown): SchemaRelationship[] {
  const describe = describeFnOf(schema);
  if (describe === null) return [];
  try {
    return describe().relationships ?? [];
  } catch {
    // Introspection must never break a run: schemas without readable
    // relationships keep their changed set unexpanded.
    return [];
  }
}

function describeFnOf(
  schema: unknown,
): (() => { relationships: SchemaRelationship[] }) | null {
  if (!isObject(schema)) return null;
  const describe = (schema as SelectiveSchema).describe;
  return typeof describe === 'function' ? describe : null;
}

/**
 * Whether a concrete changed path matches a source pattern where item
 * bindings are wildcards. A pattern item covers both array indices and
 * dynamic record keys, so it matches a concrete item as well as a
 * concrete property (record key) at the same position.
 */
function concreteMatchesPattern(
  pattern: SchemaPath,
  concrete: SchemaPath,
): boolean {
  if (pattern.length !== concrete.length) return false;
  return pattern.every((seg, index) => patternSegMatches(seg, concrete[index]));
}

/**
 * Whether a concrete changed path is a strict parent prefix of a
 * relationship source pattern. Item segments in the pattern act as
 * wildcards. A parent-level changed path (e.g. 'profile' vs source
 * [profile, country]) must pull in the relationship's targets, otherwise
 * nested failures under the parent are silently swallowed by exact-match
 * focus.
 */
function isStrictPrefixOfPattern(
  pattern: SchemaPath,
  concrete: SchemaPath,
): boolean {
  if (concrete.length === 0 || concrete.length >= pattern.length) return false;
  return concrete.every((seg, index) => patternSegMatches(pattern[index], seg));
}

function patternSegMatches(
  patternSeg: PropertySegment | ItemSegment | undefined,
  concreteSeg: PropertySegment | ItemSegment,
): boolean {
  if (patternSeg === undefined) return false;
  // Pattern items cover array indices and dynamic record keys alike.
  if (patternSeg.type === 'item') return true;
  if (concreteSeg.type === 'item') return false;
  return patternSeg.key === concreteSeg.key;
}

/**
 * Adds a relationship's targets to the affected set, concretized with the
 * concrete changed source when possible. Array targets without a usable
 * concrete index expand from run data; when expansion is impossible (no
 * data) they fall back to the top-level key — never '$item' bindings.
 */
function addConcreteTargets(
  rel: SchemaRelationship,
  concreteSource: SchemaPath,
  data: unknown,
  affectedSet: Set<string>,
): void {
  const target = rel.target;
  if (!target.some(seg => seg.type === 'item')) {
    affectedSet.add(affectedPathToName(target));
    return;
  }
  addItemTargets(target, rel.source, concreteSource, data, affectedSet);
}

function addItemTargets(
  target: SchemaPath,
  patternSource: SchemaPath,
  concreteSource: SchemaPath,
  data: unknown,
  affectedSet: Set<string>,
): void {
  const resolved = resolveConcreteTargetItems(
    target,
    patternSource,
    concreteSource,
  );
  if (resolved) {
    affectedSet.add(affectedPathToName(resolved));
    return;
  }
  addUnresolvedItemTargets(target, data, affectedSet);
}

function addUnresolvedItemTargets(
  target: SchemaPath,
  data: unknown,
  affectedSet: Set<string>,
): void {
  if (isNullish(data)) {
    const top = topLevelKeyOfChanged(target);
    if (top) affectedSet.add(top);
    return;
  }
  for (const field of expandChangedArrayTargets(target, data)) {
    affectedSet.add(field);
  }
}

/**
 * Returns the top-level key of a schema path (its first property segment).
 * Binding-free fallback when an array target cannot be expanded to
 * concrete indices: affected names must never leak internal '$item'
 * bindings.
 */
function topLevelKeyOfChanged(path: SchemaPath): string | null {
  const [first] = path as (PropertySegment | ItemSegment)[];
  if (first !== undefined && first.type === 'property') {
    return String(first.key);
  }
  return null;
}

/**
 * Resolves a relationship target's item segments to concrete indices taken
 * from the concrete changed source at the same positions (same-item).
 * Returns null when some target item has no corresponding concrete index —
 * callers then expand from run data or fall back to the top-level key
 * instead of emitting internal '$item' bindings.
 */
function resolveConcreteTargetItems(
  patternTarget: SchemaPath,
  patternSource: SchemaPath,
  concreteSource: SchemaPath,
): SchemaPath | null {
  const segs: (PropertySegment | ItemSegment)[] = [];
  for (let i = 0; i < patternTarget.length; i++) {
    const targetSeg = patternTarget[i];
    if (targetSeg === undefined) return null;
    if (targetSeg.type !== 'item') {
      segs.push({ ...targetSeg });
      continue;
    }
    // For same-item, the item binding at the same position is shared
    // between source and target, so copy the concrete index.
    const resolved = resolveChangedItemBinding(
      patternSource[i],
      concreteSource[i],
    );
    if (resolved === null) return null;
    segs.push(resolved);
  }
  return segs as SchemaPath;
}

function resolveChangedItemBinding(
  sourceSeg: PropertySegment | ItemSegment | undefined,
  concreteSeg: PropertySegment | ItemSegment | undefined,
): (PropertySegment | ItemSegment) | null {
  if (sourceSeg === undefined || concreteSeg === undefined) return null;
  if (sourceSeg.type !== 'item') return null;
  // Array indices stay items; dynamic record keys resolve to the concrete
  // property so targets read as 'dictionary.home.state', not '$item'.
  if (concreteSeg.type === 'item') {
    return { type: 'item', binding: concreteSeg.binding };
  }
  return { ...concreteSeg };
}

/**
 * Expands an array-item target path to all concrete indices present in
 * data, recursively expanding every nested $item segment. Without backing
 * data the index cannot be concretized: the branch is skipped instead of
 * leaking internal '$item' bindings, and callers fall back to the
 * top-level key when nothing expands.
 */
function expandChangedArrayTargets(
  targetPath: SchemaPath,
  data: unknown,
): string[] {
  const results: string[] = [];
  dfsChangedTarget(targetPath, 0, data, [] as unknown as SchemaPath, results);
  return results;
}

function dfsChangedTarget(
  targetPath: SchemaPath,
  pathIdx: number,
  dataNode: unknown,
  built: SchemaPath,
  results: string[],
): void {
  if (pathIdx >= targetPath.length) {
    results.push(affectedPathToName(built));
    return;
  }
  const seg = targetPath[pathIdx];
  if (seg === undefined) return;
  if (isPropertySegment(seg)) {
    const child: unknown = isObject(dataNode)
      ? (dataNode as Record<PropertyKey, unknown>)[seg.key]
      : undefined;
    dfsChangedTarget(
      targetPath,
      pathIdx + 1,
      child,
      [...built, seg] as SchemaPath,
      results,
    );
    return;
  }
  dfsChangedItem(targetPath, pathIdx, dataNode, built, results);
}

function dfsChangedItem(
  targetPath: SchemaPath,
  pathIdx: number,
  dataNode: unknown,
  built: SchemaPath,
  results: string[],
): void {
  if (isArray(dataNode)) {
    for (let i = 0; i < dataNode.length; i++) {
      dfsChangedTarget(
        targetPath,
        pathIdx + 1,
        dataNode[i],
        [...built, { type: 'item', binding: String(i) }] as SchemaPath,
        results,
      );
    }
  } else if (isObject(dataNode)) {
    // Item segment over a record — expand every dynamic key as a
    // concrete property so affected names never leak '$item' bindings.
    for (const key of Object.keys(dataNode)) {
      dfsChangedTarget(
        targetPath,
        pathIdx + 1,
        (dataNode as Record<string, unknown>)[key],
        [...built, { type: 'property', key }] as SchemaPath,
        results,
      );
    }
  }
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

function getSchemaDependencies(schema: SelectiveSchema): SchemaDependency[] {
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
  results: SelectiveSchemaResult[];
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
  schema: SelectiveSchema,
  expanded: string[],
  data: unknown,
): ArraySupplement {
  return collectArraySupplement(schema, expanded, data, mainRun);
}

function collectArraySupplement(
  schema: SelectiveSchema,
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
  readonly expanded: readonly string[];
  readonly fullMain: boolean;
  readonly gap: { found: boolean };
  readonly main: readonly SelectiveSchemaResult[];
};

function collectArraySupplementInner(
  schema: SelectiveSchema,
  data: unknown,
  context: ArraySupplementContext,
): SelectiveSchemaResult[] {
  const topSchema = schema.__schema;
  if (topSchema === undefined || !isObject(data) || isArray(data)) return [];
  const out: SelectiveSchemaResult[] = [];
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
  out: SelectiveSchemaResult[];
  /** Boundary gaps hit while running members standalone (→ full fallback). */
  readonly gap: { found: boolean };
  /** Whether the authoritative main result came from the unprojected schema. */
  readonly fullMain: boolean;
};

type IndexSelection = {
  readonly suffixes: AffectedSeg[][];
  readonly sink: IndexRunSink;
  /** Main-run failures: covered members must not execute again (P1-4). */
  readonly main: readonly SelectiveSchemaResult[];
};

function appendSupplementalFailures(
  rule: SelectiveSchema,
  value: unknown,
  selection: IndexSelection,
): void {
  if (tryAppendMembers(rule, value, selection)) return;
  if (isArray(value) || !isObject(value)) return;
  const record: Record<string, unknown> = value;
  appendShapeDescendants(rule, record, selection);
}

function tryAppendMembers(
  rule: SelectiveSchema,
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
  rule: SelectiveSchema,
  item: SelectiveSchema,
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
  rule: SelectiveSchema,
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
  main: readonly SelectiveSchemaResult[],
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
  rule: SelectiveSchema,
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
  rule: SelectiveSchema,
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
  item: SelectiveSchema,
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
  rule: SelectiveSchema,
  item: SelectiveSchema,
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
  readonly rule: SelectiveSchema;
  readonly item: SelectiveSchema;
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
  outcome: SelectiveSchemaResult[],
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
  result: SelectiveSchemaResult,
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
  rule: SelectiveSchema,
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
  readonly skipAbsent: boolean;
  readonly byKey: Map<string, AffectedSeg[][]>;
  readonly failedKey: string | null;
  readonly inner: Record<string, SelectiveSchema>;
};

function shapeDescendantContext(
  rule: SelectiveSchema,
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
  // Absent-member knowledge for shadowed members from the parent's
  // metadata: a partial-like parent never evaluates missing keys, so an
  // absent member past the boundary is valid-absent, not a shadowed
  // failure. Unknown parents skip absent members too — the full-run
  // verdict stands instead of inventing failures.
  return { byKey, failedKey, inner, skipAbsent: skipAbsentMembersOf(rule) };
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
 * A member absent from a partial-like (or unknown) parent was never
 * evaluated by the main run: running it standalone would invent a failure
 * the full run never reports. Present members — including
 * explicit-undefined ones, which container iteration evaluates — always
 * run, as do absent members of required containers (genuinely invalid).
 */
function isAbsentPartialMember(
  context: ShapeDescendantContext,
  value: Record<string, unknown>,
  key: string,
): boolean {
  return context.skipAbsent && !isPresentKey(value, key);
}

function memberPrecedesFailure(index: number, failedIndex: number): boolean {
  return failedIndex >= 0 && index < failedIndex;
}

function memberFollowsFailure(index: number, failedIndex: number): boolean {
  return failedIndex >= 0 && index > failedIndex;
}

function mainFailedAtPath(
  main: readonly SelectiveSchemaResult[],
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
  inner: Record<string, SelectiveSchema>,
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
  rule: SelectiveSchema,
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
  | { kind: 'single'; item: SelectiveSchema }
  | { kind: 'tuple'; members: SelectiveSchema[] }
  | { kind: 'union'; members: SelectiveSchema[] };

/**
 * Classifies a rule's item slot for per-member execution. Tuples carry a
 * positional member list under a kindless slot; unions carry their member
 * list under kind 'array'; records and single-rule arrays carry one member.
 */
function memberDispatch(rule: SelectiveSchema): MemberDispatch | null {
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
  return { kind: 'single', item: slot as unknown as SelectiveSchema };
}

function asMemberRules(slot: readonly unknown[]): SelectiveSchema[] {
  const members: SelectiveSchema[] = [];
  for (const entry of slot) {
    if (isObject(entry)) {
      members.push(entry as unknown as SelectiveSchema);
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
  rule: SelectiveSchema,
  members: SelectiveSchema[],
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
  rule: SelectiveSchema,
  members: SelectiveSchema[],
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
  members: readonly SelectiveSchema[],
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
  rule: SelectiveSchema,
  members: SelectiveSchema[],
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
  members: SelectiveSchema[],
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
  members: SelectiveSchema[],
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
  item: SelectiveSchema,
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
  item: SelectiveSchema,
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
  item: SelectiveSchema,
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
  projected: SelectiveSchema,
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
  rule: SelectiveSchema,
  value: unknown,
  sink: IndexRunSink,
): SelectiveSchemaResult[] {
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
  results: SelectiveSchemaResult[],
  path: string[],
): SelectiveSchemaResult[] {
  const out: SelectiveSchemaResult[] = [];
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
  main: SelectiveSchemaResult[],
  extra: SelectiveSchemaResult[],
): SelectiveSchemaResult[] {
  if (extra.length === 0) return main;
  const base = withSupplementCoercions(main, extra);
  const seen = new Set(base.map(resultKey));
  const out = [...base];
  appendUniqueFailures(out, seen, extra);
  return out;
}

function appendUniqueFailures(
  out: SelectiveSchemaResult[],
  seen: Set<string>,
  extra: SelectiveSchemaResult[],
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
  main: SelectiveSchemaResult[],
  extra: SelectiveSchemaResult[],
): SelectiveSchemaResult[] {
  const patches = coercionPatchesOf(extra);
  if (patches.length === 0) return main;
  const [first, ...rest] = main;
  if (isNullish(first)) return main;
  return [
    { ...first, type: applyCoercionPatches(first.type, patches) },
    ...rest,
  ];
}

function coercionPatchesOf(extra: SelectiveSchemaResult[]): CoercionPatch[] {
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
  result: SelectiveSchemaResult,
): result is SelectiveSchemaResult & { path: readonly string[] } {
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

function resultKey(result: SelectiveSchemaResult): string {
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
  schema: SelectiveSchema,
  affected: readonly string[],
): SelectiveSchema | null {
  try {
    return buildProjectedSchemaInner(schema, affected);
  } catch {
    // A fragment that cannot compose (e.g. a nested array rebuild orphaning
    // a source) is unprojectable — the caller falls back to the full run.
    return null;
  }
}

function buildProjectedSchemaInner(
  schema: SelectiveSchema,
  affected: readonly string[],
): SelectiveSchema | null {
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
  schema: SelectiveSchema,
): Record<string, SelectiveSchema> | null {
  const topSchema = schema?.__schema;
  if (!topSchema || typeof topSchema !== 'object') return null;
  if (!topContainerRebuildable(schema)) return null;
  return topSchema;
}

function topContainerRebuildable(schema: SelectiveSchema): boolean {
  return chainBaselineMatches(schema);
}

/**
 * Pass-through fragment for when every affected subtree runs in the
 * supplement: executes nothing but parses data through, so the main run
 * stays authoritative for parsed data without executing unaffected
 * validators (P1-4).
 */
function passThroughFragment(
  schema: SelectiveSchema,
  excluded: number,
): SelectiveSchema | null {
  if (excluded === 0) return null;
  try {
    return preserveOptionality(schema, looseRule({}));
  } catch {
    return null;
  }
}

function projectedTopRule(
  original: SelectiveSchema,
  projectedTop: Record<string, SelectiveSchema>,
): SelectiveSchema | null {
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
  topSchema: Record<string, SelectiveSchema>,
  affected: readonly string[],
): Map<string, AffectedSeg[][]> {
  const byTop = new Map<string, AffectedSeg[][]>();
  for (const field of affected) {
    appendTopGroup(byTop, topSchema, parseAffectedPath(field));
  }
  return byTop;
}

function appendTopGroup(
  byTop: Map<string, AffectedSeg[][]>,
  topSchema: Record<string, SelectiveSchema>,
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
  topSchema: Record<string, SelectiveSchema>,
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
  topSchema: Record<string, SelectiveSchema>,
  byTop: Map<string, AffectedSeg[][]>,
): {
  projectedTop: Record<string, SelectiveSchema>;
  excluded: number;
} {
  const projectedTop: Record<string, SelectiveSchema> = {};
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
  topSchema: Record<string, SelectiveSchema>,
  byTop: Map<string, AffectedSeg[][]>,
  projectedTop: Record<string, SelectiveSchema>,
): void {
  for (const top of byTop.keys()) {
    if (!hasOwnProperty(topSchema, top)) {
      projectedTop[top] = unknownExtraKeyRule();
    }
  }
}

/**
 * Sentinel for an affected key the schema does not declare. It fails exactly
 * when the key is present with a value (mirroring a strict shape()
 * extra-key failure, whose path is the key itself) and passes when the key
 * is absent, so the post-filter — not the fragment — keeps deciding
 * affectedness. Value-only rules cannot distinguish absent from
 * explicitly-undefined, so that remaining case never reaches the fragment:
 * `hasExplicitUndefinedUnknownKey` diverts it to the full-run fallback.
 */
function unknownExtraKeyRule(): SelectiveSchema {
  return enforceLazy.condition((value: unknown) => value === undefined);
}

/**
 * One top-level key's fragment fate: undefined drops an unrelated key,
 * the rule keeps an exact-selected or un-narrowed subtree, and
 * FRAGMENT_EXCLUDED leaves supplement-covered containers out.
 */
function projectTopKey(
  rule: SelectiveSchema,
  rests: AffectedSeg[][] | undefined,
): SelectiveSchema | undefined | typeof FRAGMENT_EXCLUDED {
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
  rule: SelectiveSchema,
  suffixes: AffectedSeg[][],
): SelectiveSchema | null | typeof FRAGMENT_EXCLUDED {
  const inner = rule?.__schema;
  if (inner && typeof inner === 'object') {
    return projectShapeRule(rule, inner, suffixes);
  }
  return projectItemRule(rule, suffixes);
}

function projectItemRule(
  rule: SelectiveSchema,
  suffixes: AffectedSeg[][],
): SelectiveSchema | null | typeof FRAGMENT_EXCLUDED {
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
  rule: SelectiveSchema,
  inner: Record<string, SelectiveSchema>,
  suffixes: AffectedSeg[][],
): SelectiveSchema | null {
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
  rule: SelectiveSchema,
  filtered: Record<string, SelectiveSchema>,
): SelectiveSchema | null {
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
  inner: Record<string, SelectiveSchema>,
  byKey: Map<string, AffectedSeg[][]>,
): Record<string, SelectiveSchema> {
  const filtered: Record<string, SelectiveSchema> = {};
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
  inner: Record<string, SelectiveSchema>,
  byKey: Map<string, AffectedSeg[][]>,
  filtered: Record<string, SelectiveSchema>,
): void {
  for (const key of byKey.keys()) {
    if (!hasOwnProperty(inner, key)) {
      filtered[key] = unknownExtraKeyRule();
    }
  }
}

function isUnchangedShape(
  inner: Record<string, SelectiveSchema>,
  filtered: Record<string, SelectiveSchema>,
): boolean {
  const filteredKeys = Object.keys(filtered);
  return (
    filteredKeys.length === Object.keys(inner).length &&
    filteredKeys.every(key => filtered[key] === inner[key])
  );
}

function groupAffectedByChildKey(
  inner: Record<string, SelectiveSchema>,
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
  inner: Record<string, SelectiveSchema>,
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
  schema: Record<string, SelectiveSchema>,
) => SelectiveSchema;

const looseRule = enforceLazy.loose as unknown as LooseCombinator;

type OptionalCombinator = (inner: SelectiveSchema) => SelectiveSchema;

const optionalRule = enforceLazy.optional as unknown as OptionalCombinator;

function rebuildShapeContainer(
  original: SelectiveSchema,
  filtered: Record<string, SelectiveSchema>,
): SelectiveSchema {
  return looseRule(
    isPartialLikeContainer(original) ? optionalizeMembers(filtered) : filtered,
  );
}

function optionalizeMembers(
  members: Record<string, SelectiveSchema>,
): Record<string, SelectiveSchema> {
  const optionalized: Record<string, SelectiveSchema> = {};
  for (const key of Object.keys(members)) {
    optionalized[key] = optionalRule(members[key]);
  }
  return optionalized;
}

function projectArrayRule(
  rule: SelectiveSchema,
  suffixes: AffectedSeg[][],
): SelectiveSchema | null | typeof FRAGMENT_EXCLUDED {
  if (containerKindOf(rule) === 'record') return rule;
  if (!indexSelectionsOnly(suffixes)) return rule;
  return FRAGMENT_EXCLUDED;
}

/**
 * Preserves optional-wrapped containers across projection: a rebuilt loose
 * rule would fail on nullish values that the original optional rule passes.
 */
function preserveOptionality(
  original: SelectiveSchema,
  rebuilt: SelectiveSchema,
): SelectiveSchema {
  if (!isNullishPassing(original)) return rebuilt;
  return optionalRule(rebuilt);
}

/**
 * Whether a rule passes nullish values (optional-style). Metadata-only:
 * optional() marks itself at construction; every other known combinator
 * carries a chain baseline with no marker (required semantics), and
 * unknown rules without a marker are treated as required so a rebuilt
 * fragment never gains nullish acceptance the original lacks. No user
 * code executes to decide this.
 */
function isNullishPassing(rule: SelectiveSchema): boolean {
  return symbolSlotOf(rule, OPTIONAL_RULE) === true;
}

/**
 * Narrows full-schema run results to failures under the affected changed paths.
 * Passing entries are preserved; root failures (no path) are kept since they
 * affect every field. A failure is kept on exact match or when either side is
 * a parent path of the other (affected 'profile' keeps failures at
 * 'profile.state', and a failure at 'profile' is relevant to 'profile.state').
 */
export function filterSchemaResultsToAffected(
  results: SelectiveSchemaResult[],
  affected: readonly string[],
  data: unknown,
  skip: string[] | true | null = null,
): SelectiveSchemaResult[] {
  if (skip === true) {
    // Boolean skip-all (skip(true)): every synthesized failure is skipped,
    // mirroring the runtime which skips all tests — including the
    // schema-failure tests. Same pass-through as the empty-kept path.
    return passThroughResult(results, data);
  }
  const affectedSet = new Set(affected.map(canonicalAffectedName));
  const skipSet = skipSetOf(skip);
  const kept = results.filter(result =>
    keepSchemaResult(result, affectedSet, skipSet),
  );
  return keptOrPassThrough(kept, results, data);
}

function keptOrPassThrough(
  kept: SelectiveSchemaResult[],
  results: SelectiveSchemaResult[],
  data: unknown,
): SelectiveSchemaResult[] {
  if (kept.length > 0) {
    return kept;
  }
  return passThroughResult(results, data);
}

function passThroughResult(
  results: SelectiveSchemaResult[],
  data: unknown,
): SelectiveSchemaResult[] {
  // A fabricated pass carries the surviving parsed output — the first
  // passing entry's type — or the raw input when nothing passed. Reading
  // results[0] unconditionally would leak a filtered-out failure's
  // partially-coerced type as if it were parsed output.
  return [
    { pass: true, type: results.find(result => result.pass)?.type ?? data },
  ];
}

function skipSetOf(skip: string[] | null): Set<string> {
  // Raw entries only: the runtime matches skip() against user-test names
  // exactly (no normalization), so normalizing here would drop synthesized
  // failures the full run still reports (nested skips are no-ops in
  // omit()). Canonicalization stays on the affected-matching side only.
  return new Set(skip ?? []);
}

function keepSchemaResult(
  result: SelectiveSchemaResult,
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
function isSkippedName(
  result: SelectiveSchemaResult,
  skipSet: Set<string>,
): boolean {
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
  result: SelectiveSchemaResult,
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
function isN4sSchema(schema: unknown): boolean {
  return (
    isN4sVendorSchema(schema) &&
    (schema as SelectiveSchema)?.__schema !== undefined
  );
}

/**
 * Intersects the caller-computed affected set with the `only` inclusion
 * focus: `only` narrows execution and is never silently dropped. A nullish
 * `only` leaves the affected set untouched (plain changed() runs); an
 * explicit empty `only` runs nothing. Matching is parent-either-way on
 * canonical dotted names, mirroring result filtering: `only: 'profile'`
 * keeps `profile.state`, and `only: 'profile.state'` keeps `profile`.
 */
function intersectAffectedWithOnly(
  affected: readonly string[] | null | undefined,
  only: readonly string[] | null,
): readonly string[] | null {
  if (affected == null || only == null) return affected ?? null;
  if (only.length === 0) return [];
  const onlyNames = only.map(canonicalAffectedName);
  return affected.filter(field =>
    onlyNames.some(name =>
      focusSelectsName(name, canonicalAffectedName(field)),
    ),
  );
}

function focusSelectsName(onlyName: string, field: string): boolean {
  return (
    onlyName === field ||
    onlyName.startsWith(`${field}.`) ||
    field.startsWith(`${onlyName}.`)
  );
}

function applySchemaFocus(
  schema: SelectiveSchema,
  modifiers: FocusModifiers,
): SelectiveSchema {
  // Root-container n4s schemas run unfocused here (pick/omit need __schema
  // keys); runFlatSchema still narrows their failures by affected path.
  if (!isN4sSchema(schema)) {
    return schema;
  }

  const only = buildArrayProp(modifiers.only);
  const skip = buildArrayProp(modifiers.skip);

  return buildFocusedSchemaInstance(schema, only, skip);
}

function buildArrayProp(
  prop: string | readonly string[] | boolean | null | undefined,
): string[] | null {
  if (!prop) return null;
  // An explicitly empty array is a zero-field focus (e.g. changed([])):
  // keep it so the schema resolves to an empty pick instead of no focus.
  // Non-string entries never reach name matching: asArray(true) is [true]
  // and name normalization would throw on it (boolean skip-all is a legal
  // modifier, handled as match-all by buildSkipFilter instead).
  // Copy readonly arrays: asArray only accepts mutable element lists.
  const list = Array.isArray(prop) ? [...prop] : prop;
  return asArray(list).filter(
    (entry): entry is string => typeof entry === 'string',
  );
}

/**
 * Skip filter for synthesized failures. Boolean skip-all (skip(true))
 * drops every failure, mirroring the runtime which skips all tests;
 * name lists narrow by exact field name via buildArrayProp.
 */
function buildSkipFilter(
  skipProp: string | readonly string[] | boolean | null | undefined,
): string[] | true | null {
  if (skipProp === true) return true;
  return buildArrayProp(skipProp);
}

function buildIntersectedSchemaInstance(
  schema: SelectiveSchema,
  only: string[],
  skip: string[],
): SelectiveSchema {
  const skipSet = new Set(skip);
  const members = (schema.__schema ?? {}) as unknown as Record<
    string,
    SchemaMemberRule
  >;
  const picked = enforceLazy.pick(
    members,
    only.filter(f => !skipSet.has(f)),
  );
  return picked as unknown as SelectiveSchema;
}

function buildFocusedSchemaInstance(
  schema: SelectiveSchema,
  only: string[] | null,
  skip: string[] | null,
): SelectiveSchema {
  const members = (schema.__schema ?? {}) as unknown as Record<
    string,
    SchemaMemberRule
  >;
  if (only) {
    return skip
      ? buildIntersectedSchemaInstance(schema, only, skip)
      : (enforceLazy.pick(members, only) as unknown as SelectiveSchema);
  }

  return skip
    ? (enforceLazy.omit(members, skip) as unknown as SelectiveSchema)
    : schema;
}

/**
 * Converts unknown schema.run return value into a stable internal representation.
 */
function normalizeSelectiveSchemaResult(
  candidate: unknown,
  fallbackType: unknown,
): SelectiveSchemaResult[] {
  if (isArray(candidate)) {
    return candidate.map(entry =>
      normalizeSingleSelectiveSchemaResult(entry, fallbackType),
    );
  }

  return [normalizeSingleSelectiveSchemaResult(candidate, fallbackType)];
}

/**
 * Converts a single unknown run payload into a safe result shape.
 */
function normalizeSingleSelectiveSchemaResult(
  candidate: unknown,
  fallbackType: unknown,
): SelectiveSchemaResult {
  if (!isSelectiveSchemaResult(candidate)) {
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
function isSelectiveSchemaResult(
  candidate: unknown,
): candidate is SelectiveSchemaResult {
  if (!isObject(candidate)) {
    return false;
  }

  const value = candidate as Partial<SelectiveSchemaResult>;

  const hasPass = typeof value.pass === 'boolean';
  const hasPath =
    value.path === undefined ||
    (isArray(value.path) && value.path.every(item => typeof item === 'string'));

  return hasPass && hasPath;
}

/**
 * Detects parse errors that represent genuine validation failures (the
 * foreign-parse fallback path only — n4s rules report failures via
 * `validate` issues and never reach here). Only validation-marked errors
 * take the fallback: a bare TypeError is a programming error (buggy
 * validator, broken getter) and stays loud instead of being hidden behind
 * a run-again pass.
 */
function isExpectedSchemaParseError(error: unknown): boolean {
  if (error instanceof EnforceSchemaError) return true;
  if (!isObject(error)) return false;
  const typedError = error as { isValidation?: unknown; name?: unknown };
  return (
    typedError.isValidation === true || typedError.name === 'EnforceSchemaError'
  );
}

/**
 * Determines whether schema.run should execute after a successful parse call.
 *
 * For n4s StandardSchema-backed rules, parse already performs full validation.
 * Re-running run(parsed) can break coercion chains where post-parse types differ
 * from pre-parse input expectations.
 */
function shouldRunAfterParse(schema: SelectiveSchema): boolean {
  if (!isFunction(schema.run)) {
    return false;
  }

  const standard = schema as unknown as {
    '~standard'?: { vendor?: unknown };
  };
  return standard['~standard']?.vendor !== N4S_VENDOR;
}
