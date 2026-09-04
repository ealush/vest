import { hasOwnProperty, isNullish, isObject } from 'vest-utils';

import { EnforceSchemaError } from '../errors/EnforceSchemaError';
import type { RuleInstance } from '../utils/RuleInstance';
import type { ItemSegment, PropertySegment, SchemaPath } from './SchemaPath';
import { propertySegment } from './SchemaPath';
import type {
  InternalRelationship,
  SchemaRelationship,
} from './SchemaRelationship';
import {
  createScopeProxy,
  getRefPath,
  isRootRef,
  normalizeResolverResult,
} from './scopeProxy';
import type { Scope } from './scopeProxy';

// Symbols for storing unresolved deps on RuleInstance — must use Symbol.for to match chainBuilder
export const UNRESOLVED_DEPS = Symbol.for('vest:unresolvedDeps');
export const RESOLVED_RELATIONSHIPS = Symbol.for('vest:resolvedRelationships');
export const ITEM_SCHEMA = Symbol.for('vest:itemSchema');
/**
 * Describes how a rule was built, so dependency-aware consumers (e.g.
 * suite.changed() fragment projection) can prove a rebuild preserves
 * behavior. The chain predicate list itself is closure-private; this is
 * the only observable trace of it.
 */
export type ChainInfo = {
  /** Predicates in this rule's own chain at last sync. */
  readonly length: number;
  /** Whether a custom message was set (affects failure text). */
  readonly hasMessage: boolean;
};
export const CHAIN_INFO = Symbol.for('vest:chainInfo');
/**
 * Frozen at combinator-construction time: the chain state a rebuild must
 * reproduce. Delegating wrappers (optional) snapshot the inner rule's
 * state; fresh-validation combinators snapshot their own.
 */
export const CHAIN_BASELINE = Symbol.for('vest:chainBaseline');
/**
 * Frozen construction-time chain state a rebuild must reproduce. For
 * delegating wrappers (optional) `inner` captures the wrapped rule so
 * drift checks recurse: mutating the wrapped rule after wrapping breaks
 * rebuild parity exactly like chaining the wrapper itself.
 */
export type ChainBaseline = {
  /** Chain length at snapshot time. */
  readonly length: number;
  /** Whether a custom message was set at snapshot time. */
  readonly hasMessage: boolean;
  /** The wrapped rule for delegating wrappers; absent otherwise. */
  readonly inner?: unknown;
};

function slotOf(rule: unknown, slot: symbol): unknown {
  if (rule === null) return undefined;
  const kind = typeof rule;
  if (kind !== 'object' && kind !== 'function') return undefined;
  return (rule as Record<symbol, unknown>)[slot];
}

/** Whether the rule carries a construction-time chain baseline. */
export function hasChainBaseline(rule: unknown): boolean {
  return slotOf(rule, CHAIN_BASELINE) !== undefined;
}

/**
 * Whether the rule's chain still matches its construction-time baseline.
 * A mismatch means predicates (or a custom message) were added after the
 * combinator built the rule, so rebuilding through the bare combinator
 * would silently drop validators. Recurses into delegating wrappers via
 * the captured inner rule. Missing slots mean unknown provenance — never
 * a match, so consumers retain the original rule (full-run parity).
 */
export function chainBaselineMatches(rule: unknown): boolean {
  const baseline = slotOf(rule, CHAIN_BASELINE) as ChainBaseline | undefined;
  const current = slotOf(rule, CHAIN_INFO) as ChainInfo | undefined;
  if (baseline === undefined || current === undefined) return false;
  if (!sameChainState(current, baseline)) return false;
  if (baseline.inner === undefined) return true;
  return chainBaselineMatches(baseline.inner);
}

function sameChainState(current: ChainInfo, baseline: ChainBaseline): boolean {
  return (
    current.length === baseline.length &&
    current.hasMessage === baseline.hasMessage
  );
}
/** Marks containers that skip missing keys (partial), unlike loose. */
export const PARTIAL_LIKE = Symbol.for('vest:partialLike');
/** Marks nullish-passing optional() wrappers. */
export const OPTIONAL_RULE = Symbol.for('vest:optionalRule');
/**
 * Marks which container flavor owns an ITEM_SCHEMA slot: single-rule
 * arrays/lists narrow with `isArrayOf`, records narrow with `record`.
 * Suffixes alone cannot tell them apart (numeric record keys look like
 * indices), and rebuilding through the wrong combinator changes
 * validation semantics — so the kind travels with the slot.
 */
export const ITEM_CONTAINER = Symbol.for('vest:itemContainer');
export type ItemContainerKind = 'array' | 'record';

export type UnresolvedDep = {
  resolver: (scope: Scope) => unknown;
};

/**
 * Collects unresolved deps from a field RuleInstance.
 */
export function getUnresolvedDeps(
  rule: RuleInstance<unknown, unknown[]>,
): UnresolvedDep[] {
  return (
    ((rule as unknown as Record<symbol, unknown>)[
      UNRESOLVED_DEPS
    ] as UnresolvedDep[]) || []
  );
}

export function setUnresolvedDeps(
  rule: RuleInstance<unknown, unknown[]>,
  deps: UnresolvedDep[],
): void {
  (rule as unknown as Record<symbol, unknown>)[UNRESOLVED_DEPS] =
    deps as unknown;
}

export function getResolvedRelationships(
  rule: RuleInstance<unknown, unknown[]>,
): SchemaRelationship[] {
  return (
    ((rule as unknown as Record<symbol, unknown>)[
      RESOLVED_RELATIONSHIPS
    ] as SchemaRelationship[]) || []
  );
}

export function setResolvedRelationships(
  rule: RuleInstance<unknown, unknown[]>,
  rels: SchemaRelationship[],
): void {
  (rule as unknown as Record<symbol, unknown>)[RESOLVED_RELATIONSHIPS] =
    rels as unknown;
}

/**
 * Resolves inline deps for a shape's own fields.
 * Returns relationships where source → target.
 */
// eslint-disable-next-line complexity
export function resolveInlineDeps(
  shape: Record<string, RuleInstance<unknown, unknown[]>>,
  scopePath: SchemaPath,
  rootShape: Record<PropertyKey, unknown>,
): SchemaRelationship[] {
  const relationships: SchemaRelationship[] = [];
  const scopeProxy = createScopeProxy(scopePath);

  for (const fieldKey of Object.keys(shape)) {
    const fieldRule = shape[fieldKey];
    if (!fieldRule) continue;

    const unresolved = getUnresolvedDeps(
      fieldRule as unknown as RuleInstance<unknown, unknown[]>,
    );
    if (!unresolved || unresolved.length === 0) continue;

    const targetPath: SchemaPath = [...scopePath, propertySegment(fieldKey)];

    for (const dep of unresolved) {
      if (typeof dep.resolver !== 'function') {
        throw new EnforceSchemaError(
          `EnforceSchemaError: "${String(fieldKey)}" dependsOn expects a function, got ${typeof dep.resolver}`,
        );
      }
      let result: unknown;
      try {
        result = dep.resolver(scopeProxy);
      } catch (e) {
        // Resolver threw — treat as error
        throw new EnforceSchemaError(
          `Failed to resolve dependency for "${String(fieldKey)}": ${(e as Error).message}`,
        );
      }

      if (result === undefined) {
        throw new EnforceSchemaError(
          `EnforceSchemaError: "${String(fieldKey)}" dependsOn resolver returned undefined. Did you forget to return the dependency (e.g., $ => $.other)? Return an explicit empty array [] for intentionally zero dependencies.`,
        );
      }
      const refs = normalizeResolverResult(result);
      // An explicit empty array is the intentional zero-dependency form.
      if (
        refs.length === 0 &&
        !(Array.isArray(result) && result.length === 0)
      ) {
        throw new EnforceSchemaError(
          `EnforceSchemaError: "${String(fieldKey)}" dependsOn resolver must return a dependency ref (e.g., $ => $.other) or array of refs, got ${typeof result}`,
        );
      }
      if (
        Array.isArray(result) &&
        refs.length !== (result as unknown[]).length
      ) {
        throw new EnforceSchemaError(
          `EnforceSchemaError: "${String(fieldKey)}" dependsOn resolver array contains non-dependency values`,
        );
      }

      for (const ref of refs) {
        let sourcePath: SchemaPath = getRefPath(ref);
        const isRoot = isRootRef(ref);

        // Self-dependency normalization: bare $.self means the field itself,
        // e.g., enforce.isString().dependsOn($ => $.self) inside field "a"
        // resolves to the owning field (filtered as a no-op below). A real
        // sibling field named "self" takes precedence: when the current scope
        // declares its own "self" field, $.self references that sibling.
        if (
          sourcePath.length > 0 &&
          sourcePath[sourcePath.length - 1].type === 'property' &&
          String(
            (sourcePath[sourcePath.length - 1] as unknown as PropertySegment)
              .key,
          ) === 'self'
        ) {
          // Single self: $.self => owning field (unless shadowed by sibling)
          if (
            sourcePath.length === scopePath.length + 1 &&
            isPathPrefixedBy(sourcePath.slice(0, -1), scopePath) &&
            !Object.prototype.hasOwnProperty.call(shape, 'self')
          ) {
            sourcePath = targetPath;
          } else {
            // $.self.foo etc., or sibling "self" — validated as a normal ref
          }
        }

        // Self-dependency is no-op: deduplicate / filter
        // If a field depends on itself, it creates no useful edge — skip silently.
        // Documented decision: self-dependency is filtered, not thrown.
        if (pathsEqual(sourcePath, targetPath)) {
          continue;
        }

        // Validate existence — skip for rooted refs at inner creation time
        // (they will be validated at outermost mount if needed)
        if (!isRoot) {
          validateSourceExists(
            sourcePath,
            rootShape,
            String(fieldKey),
            scopePath,
          );
        }

        const rel: InternalRelationship = isRoot
          ? {
              source: sourcePath,
              target: targetPath,
              effect: 'invalidate',
              __isRootSource: true,
            }
          : { source: sourcePath, target: targetPath, effect: 'invalidate' };

        relationships.push(rel);
      }
    }
  }

  // Composition stays lenient: a reusable fragment cannot know its final root
  // until mounted, so dangling $.root edges are NOT rejected here. They are
  // validated at finalization — standalone n4s runs via
  // assertRuleRootedPathsValid (called from the chain test/run/parse/validate
  // path) and Vest suites via the createSuite() finalizer.

  return relationships;
}

/**
 * Finalization boundary for standalone n4s schemas: validates the rooted
 * endpoints of a rule's own stored relationships against the rule's own root
 * shape. Called from the chain test/run/parse/validate path so the same
 * schema is valid or invalid regardless of whether it passes through Vest.
 * Rules without rooted relationships (the common case) return immediately.
 */
export function assertRuleRootedPathsValid(rule: unknown): void {
  if (!rule || typeof rule !== 'object') return;
  const rels = checkableRootedRels(rule);
  if (!rels) return;
  const rootShape = rootShapeOf(rule);
  if (!rootShape) return;
  validateRootedRels(rels, rootShape);
}

function checkableRootedRels(rule: object): InternalRelationship[] | null {
  const rels = (rule as Record<symbol, unknown>)[RESOLVED_RELATIONSHIPS];
  if (!Array.isArray(rels)) return null;
  const checkable = (rels as unknown[]).filter(isCheckableRel);
  const hasRooted = checkable.some(
    rel => rel.__isRootSource === true || rel.__isRootTarget === true,
  );
  return hasRooted ? checkable : null;
}

function rootShapeOf(rule: object): Record<PropertyKey, unknown> | null {
  const rootShape = (rule as { __schema?: unknown }).__schema;
  if (!rootShape || typeof rootShape !== 'object') return null;
  return rootShape as Record<PropertyKey, unknown>;
}

function validateRootedRels(
  rels: InternalRelationship[],
  rootShape: Record<PropertyKey, unknown>,
): void {
  for (const rel of rels) {
    if (rel.__isRootSource === true) {
      validateRootedPath(rel.source, rootShape, targetFieldName(rel.target));
    }
    if (rel.__isRootTarget === true) {
      validateRootedPath(rel.target, rootShape, targetFieldName(rel.source));
    }
  }
}

function isCheckableRel(rel: unknown): rel is InternalRelationship {
  return (
    !!rel &&
    typeof rel === 'object' &&
    Array.isArray((rel as InternalRelationship).source) &&
    Array.isArray((rel as InternalRelationship).target)
  );
}

function targetFieldName(path: SchemaPath | undefined): string {
  if (Array.isArray(path) && path.length) {
    const last = path[path.length - 1];
    if (last && last.type === 'property') {
      return String((last as unknown as PropertySegment).key);
    }
  }
  return 'unknown';
}

/**
 * Walks a rooted path against the current root shape. Same boundary as the
 * suite finalizer: missing keys (including missing descendants of scalar
 * fields) throw EnforceSchemaError.
 */
function validateRootedPath(
  path: SchemaPath,
  rootShape: Record<PropertyKey, unknown>,
  fieldForMsg: string,
): void {
  const unknownField = dottedSchemaPath(path);
  let current: unknown = rootShape;
  for (let i = 0; i < path.length; i++) {
    current = checkRootedSegment(
      path[i],
      current,
      i === path.length - 1,
      fieldForMsg,
      unknownField,
    );
  }
}

function checkRootedSegment(
  seg: SchemaPath[number] | undefined,
  current: unknown,
  isLast: boolean,
  fieldForMsg: string,
  unknownField: string,
): unknown {
  if (!seg || seg.type !== 'property') return current;
  const key = String((seg as unknown as PropertySegment).key);
  assertRootKeyExists(current, key, fieldForMsg, unknownField);
  if (isLast) return (current as Record<PropertyKey, unknown>)[key];
  return childShape((current as Record<PropertyKey, unknown>)[key]);
}

/**
 * Canonical dotted form of a schema path for error messages (property keys
 * by name, item segments by binding). Unknown-field errors always quote
 * this full path, never the leaf alone, so nested misses like
 * `$.root.account.missing` read as "account.missing".
 */
function dottedSchemaPath(path: SchemaPath): string {
  return path
    .map(seg =>
      seg.type === 'property' ? String(seg.key) : String(seg.binding),
    )
    .join('.');
}

function assertRootKeyExists(
  current: unknown,
  key: string,
  fieldForMsg: string,
  unknownField: string,
): void {
  if (
    !current ||
    typeof current !== 'object' ||
    !Object.prototype.hasOwnProperty.call(current, key)
  ) {
    throw new EnforceSchemaError(
      `EnforceSchemaError: "${fieldForMsg}" depends on unknown field "${unknownField}"`,
    );
  }
}

function childShape(rule: unknown): unknown {
  if (!rule || typeof rule !== 'object') return {};
  const candidate = rule as {
    __schema?: Record<PropertyKey, unknown>;
    [key: symbol]: unknown;
  };
  if (candidate.__schema) return candidate.__schema;
  return itemChildShape(candidate[ITEM_SCHEMA]);
}

function itemChildShape(item: unknown): unknown {
  if (!item || typeof item !== 'object') return {};
  if (Array.isArray(item)) return mergedItemShape(item);
  return (item as { __schema?: Record<PropertyKey, unknown> }).__schema ?? {};
}

/**
 * Merges the __schemas of several item rules (tuple elements or multi-rule
 * array members) so dotted-path validation can traverse the union. Members
 * without a __schema contribute nothing.
 */
function mergedItemShape(itemSchemas: unknown[]): Record<PropertyKey, unknown> {
  const merged: Record<PropertyKey, unknown> = {};
  for (const entry of itemSchemas) {
    Object.assign(merged, itemEntryShape(entry));
  }
  return merged;
}

function itemEntryShape(entry: unknown): Record<PropertyKey, unknown> {
  if (!entry || typeof entry !== 'object') return {};
  const inner = (entry as { __schema?: unknown }).__schema;
  if (!inner || typeof inner !== 'object') return {};
  return inner as Record<PropertyKey, unknown>;
}

// eslint-disable-next-line complexity
function validateSourceExists(
  sourcePath: SchemaPath,
  rootShape: Record<PropertyKey, unknown>,
  targetField: string,
  scopePath: SchemaPath,
): void {
  let current: Record<PropertyKey, unknown> = rootShape as unknown as Record<
    PropertyKey,
    unknown
  >;
  // Walk to scopePath to find the containing shape
  for (const seg of scopePath) {
    if (seg.type === 'property') {
      const next = (current as Record<PropertyKey, unknown>)[
        seg.key as PropertyKey
      ];
      if (
        next &&
        typeof next === 'object' &&
        Object.prototype.hasOwnProperty.call(next as object, '__schema')
      ) {
        current = (
          next as unknown as { __schema: Record<PropertyKey, unknown> }
        ).__schema;
      } else if (next && typeof next === 'object') {
        current = next as Record<PropertyKey, unknown>;
      } else {
        return;
      }
    } else if (seg.type === 'item') {
      // Descend into the item shape so leaf checks run against the member
      // shape. (No writer ever produced the legacy `__itemSchema` string
      // slot — the graph lives in the ITEM_SCHEMA symbol slot.)
      const itemSchema = (current as unknown as Record<symbol, unknown>)[
        ITEM_SCHEMA
      ];
      if (itemSchema && typeof itemSchema === 'object') {
        current = (
          Array.isArray(itemSchema)
            ? mergedItemShape(itemSchema)
            : ((itemSchema as { __schema?: unknown }).__schema ?? {})
        ) as Record<PropertyKey, unknown>;
      }
    }
  }

  const isRooted = !isPathPrefixedBy(sourcePath, scopePath);

  // Quoted in every unknown-field error below: the full dotted source path,
  // never the leaf alone.
  const unknownField = dottedSchemaPath(sourcePath);

  // Scalar-descendant check: walk sourcePath intermediates and ensure each
  // prefix before the next property is a shape-like (has __schema), not a scalar.
  // For path [obj, leaf] where obj is string, the field `obj` scalar has a child `leaf` → error.
  // We check from the effective root of sourcePath.
  const sourceRoot: Record<PropertyKey, unknown> = (
    isRooted ? rootShape : current
  ) as Record<PropertyKey, unknown>;
  let walkShape: Record<PropertyKey, unknown> | null =
    sourceRoot as unknown as Record<PropertyKey, unknown> | null;
  // For non-rooted paths, strip scopePath prefix to get relative path within current scope
  const relativePath: SchemaPath = isRooted
    ? sourcePath
    : sourcePath.slice(scopePath.length);

  for (let i = 0; i < relativePath.length - 1; i++) {
    const seg = relativePath[i];
    if (seg.type !== 'property') continue;
    const rule = (walkShape as Record<PropertyKey, unknown>)?.[
      seg.key as string
    ];
    if (!rule) continue;
    const isShapeLike =
      rule &&
      typeof rule === 'object' &&
      (Object.prototype.hasOwnProperty.call(rule, '__schema') ||
        Object.prototype.hasOwnProperty.call(rule, RESOLVED_RELATIONSHIPS) ||
        Object.prototype.hasOwnProperty.call(rule, ITEM_SCHEMA));
    if (!isShapeLike) {
      // This segment is scalar but has a descendant — invalid
      const descendant = String(
        (relativePath[relativePath.length - 1] as unknown as PropertySegment)
          .key,
      );
      const scalarKey = String(seg.key);
      throw new EnforceSchemaError(
        `EnforceSchemaError: "${targetField}" depends on "${unknownField}" but "${scalarKey}" is a scalar field and has no child "${descendant}"`,
      );
    }
    // Descend into shape for next iteration
    if (
      (rule as unknown as { __schema?: Record<PropertyKey, unknown> }).__schema
    ) {
      walkShape = (
        rule as unknown as { __schema: Record<PropertyKey, unknown> }
      ).__schema;
    } else if ((rule as unknown as Record<symbol, unknown>)[ITEM_SCHEMA]) {
      const itemSchema = (rule as unknown as Record<symbol, unknown>)[
        ITEM_SCHEMA
      ];
      walkShape = Array.isArray(itemSchema)
        ? mergedItemShape(itemSchema)
        : ((
            itemSchema as unknown as {
              __schema?: Record<PropertyKey, unknown>;
            }
          )?.__schema ?? (itemSchema as Record<PropertyKey, unknown>));
    } else {
      walkShape = null;
    }
  }

  const shapeToCheck: Record<PropertyKey, unknown> = isRooted
    ? rootShape
    : current;
  // For scalar-descendant with chained path, leaf already handled above;
  // for simple path, check leaf existence.
  // Resolve the immediate parent shape for leaf check
  let parentShape: Record<PropertyKey, unknown> | null =
    sourceRoot as unknown as Record<PropertyKey, unknown> | null;
  if (relativePath.length > 1) {
    // Walk to parent of leaf
    for (let i = 0; i < relativePath.length - 1; i++) {
      const seg = relativePath[i];
      if (seg.type !== 'property') continue;
      const key = String((seg as unknown as PropertySegment).key);
      if (!parentShape || typeof parentShape !== 'object') {
        throw new EnforceSchemaError(
          `EnforceSchemaError: "${targetField}" depends on unknown field "${unknownField}"`,
        );
      }
      const rule = (parentShape as Record<PropertyKey, unknown>)[key] as
        | (Record<PropertyKey, unknown> & {
            __schema?: Record<PropertyKey, unknown>;
            [key: symbol]: unknown;
          })
        | null
        | undefined;
      if (rule === undefined || rule === null) {
        const suggestion = findClosestKey(key, Object.keys(parentShape));
        let msg = `EnforceSchemaError: "${targetField}" depends on unknown field "${unknownField}"`;
        if (suggestion) {
          msg += `. Did you mean "${suggestion}"?`;
        }
        throw new EnforceSchemaError(msg);
      }
      if (
        (rule as unknown as { __schema?: Record<PropertyKey, unknown> })
          ?.__schema
      )
        parentShape = (
          rule as unknown as { __schema: Record<PropertyKey, unknown> }
        ).__schema;
      else if ((rule as unknown as Record<symbol, unknown>)[ITEM_SCHEMA]) {
        const itemSchema = (rule as unknown as Record<symbol, unknown>)[
          ITEM_SCHEMA
        ];
        parentShape = Array.isArray(itemSchema)
          ? mergedItemShape(itemSchema)
          : ((
              itemSchema as unknown as {
                __schema?: Record<PropertyKey, unknown>;
              }
            )?.__schema ?? parentShape);
      } else parentShape = null;
    }
  } else {
    parentShape = shapeToCheck as Record<PropertyKey, unknown> | null;
  }
  const keyToCheck = sourcePath[sourcePath.length - 1];
  if (!keyToCheck || keyToCheck.type !== 'property') return;

  const checkShape = (parentShape ?? shapeToCheck) as Record<
    PropertyKey,
    unknown
  >;
  const exists = Object.prototype.hasOwnProperty.call(
    checkShape,
    keyToCheck.key as string,
  );
  if (!exists) {
    const suggestion = findClosestKey(
      String(keyToCheck.key),
      Object.keys(checkShape),
    );
    let msg = `EnforceSchemaError: "${targetField}" depends on unknown field "${unknownField}"`;
    if (suggestion) {
      msg += `. Did you mean "${suggestion}"?`;
    }
    throw new EnforceSchemaError(msg);
  }
}

// eslint-disable-next-line complexity
function pathsEqual(a: SchemaPath, b: SchemaPath): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].type !== b[i].type) return false;
    if (
      a[i].type === 'property' &&
      (a[i] as unknown as PropertySegment).key !==
        (b[i] as unknown as PropertySegment).key
    )
      return false;
    if (
      a[i].type === 'item' &&
      (a[i] as unknown as ItemSegment).binding !==
        (b[i] as unknown as ItemSegment).binding
    )
      return false;
  }
  return true;
}

// eslint-disable-next-line complexity
function isPathPrefixedBy(path: SchemaPath, prefix: SchemaPath): boolean {
  if (prefix.length === 0) return true;
  if (path.length < prefix.length) return false;
  for (let i = 0; i < prefix.length; i++) {
    if (path[i].type !== prefix[i].type) return false;
    if (
      path[i].type === 'property' &&
      (path[i] as unknown as PropertySegment).key !==
        (prefix[i] as unknown as PropertySegment).key
    )
      return false;
  }
  return true;
}

function findClosestKey(input: string, keys: string[]): string | null {
  let best: string | null = null;
  let bestDist = Infinity;
  for (const key of keys) {
    const dist = levenshtein(input, key);
    if (dist < bestDist && dist <= 2) {
      bestDist = dist;
      best = key;
    }
  }
  return best;
}

// eslint-disable-next-line complexity
function levenshtein(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1))
        matrix[i][j] = matrix[i - 1][j - 1];
      else
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1,
        );
    }
  }
  return matrix[b.length][a.length];
}

function recordOf(value: unknown): Record<PropertyKey, unknown> {
  return value as unknown as Record<PropertyKey, unknown>;
}

// eslint-disable-next-line complexity -- moved suite finalizer, branchy by nature
function nestedShapeOf(rule: unknown): Record<PropertyKey, unknown> {
  const child: unknown = isObject(rule) ? recordOf(rule).__schema : undefined;
  if (isObject(child)) return recordOf(child);
  const item: unknown = isObject(rule)
    ? recordOf(rule)[ITEM_SCHEMA]
    : undefined;
  const itemChild: unknown = isObject(item)
    ? recordOf(item).__schema
    : undefined;
  if (isObject(itemChild)) return recordOf(itemChild);
  return {};
}

function lastPropertyKeyOf(path: SchemaPath): string {
  const last: SchemaPath[number] | undefined = path[path.length - 1];
  if (last !== undefined && last.type === 'property') return String(last.key);
  return 'unknown';
}

/**
 * Suite-creation finalizer for deferred (`$.root`) relationship endpoints.
 * Composition stays lenient so focused fragments keep composing; this
 * boundary validates the rooted endpoints of the whole mounted graph
 * against the final root shape and throws EnforceSchemaError on unknown
 * fields. Non-enforce errors are ignored so introspection never breaks
 * suite creation.
 */
export function assertSchemaRootPathsValid(schema: unknown): void {
  try {
    assertSchemaRootPathsValidInner(schema);
  } catch (e) {
    // instanceof-first, with an error-name fallback for errors thrown by a
    // second copy of the n4s classes (dual-copy interop).
    if (e instanceof EnforceSchemaError) throw e;
    if (isObject(e) && (e as { name?: unknown }).name === 'EnforceSchemaError')
      throw e;
    // Non-enforce errors (e.g., describe not available) are ignored
  }
}

// eslint-disable-next-line complexity -- moved suite finalizer, branchy by nature
function assertSchemaRootPathsValidInner(schema: unknown): void {
  const relationships: InternalRelationship[] = [];
  const seen = new WeakSet<object>();
  // eslint-disable-next-line complexity -- moved suite finalizer, branchy by nature
  const collect = (node: unknown): void => {
    if (!node || typeof node !== 'object' || seen.has(node)) return;
    seen.add(node);
    const rels = recordOf(node)[RESOLVED_RELATIONSHIPS] as
      | InternalRelationship[]
      | undefined;
    if (Array.isArray(rels) && rels.length) relationships.push(...rels);
    const inner: unknown = recordOf(node).__schema;
    if (!isNullish(inner) && typeof inner === 'object') {
      if (Array.isArray(inner)) {
        for (const v of inner as unknown[]) collect(v);
      } else {
        for (const v of Object.values(recordOf(inner))) collect(v);
        collect(inner);
      }
    }
    const item: unknown = recordOf(node)[ITEM_SCHEMA];
    if (item) collect(item);
    // Plain shape object (no __schema/RESOLVED wrapper)
    if (
      !recordOf(node).__schema &&
      !recordOf(node)[RESOLVED_RELATIONSHIPS] &&
      !recordOf(node)[ITEM_SCHEMA]
    ) {
      // Check if this looks like a plain shape record
      const vals = Object.values(recordOf(node));
      if (
        vals.length &&
        vals.some(
          (v: unknown): boolean =>
            !isNullish(v) &&
            typeof v === 'object' &&
            recordOf(v).__schema !== undefined,
        )
      ) {
        for (const v of vals) collect(v);
      } else if (
        vals.length &&
        vals.some(
          (v: unknown): boolean =>
            !isNullish(v) &&
            typeof v === 'object' &&
            recordOf(v)[RESOLVED_RELATIONSHIPS] !== undefined,
        )
      ) {
        for (const v of vals) collect(v);
      }
    }
  };
  collect(schema);
  // Also collect from schema.__schema directly if schema is a RuleInstance wrapping a plain shape
  const schemaInner: unknown = recordOf(schema).__schema;
  if (schemaInner) collect(schemaInner);
  if (!relationships.length) return;
  // Also consider top-level keys from describe dependencies target
  for (const rel of relationships) {
    const isRootSource = rel.__isRootSource === true;
    const isRootTarget = rel.__isRootTarget === true;
    if (!isRootSource && !isRootTarget) continue;
    // For root source, check full path exists in final schema (not just top-level)
    // to catch missing descendant like $.root.account.missing

    const checkPath = (path: SchemaPath, fieldForMsg: string): void => {
      const rootShape: unknown = recordOf(schema).__schema;
      const unknownField = dottedSchemaPath(path);
      let current: Record<PropertyKey, unknown> = isObject(rootShape)
        ? recordOf(rootShape)
        : {};
      path.forEach((seg: SchemaPath[number], i: number): void => {
        if (seg.type !== 'property') return;
        const key = String(seg.key);
        if (!hasOwnProperty(current, key)) {
          throw new EnforceSchemaError(
            `EnforceSchemaError: "${fieldForMsg}" depends on unknown field "${unknownField}"`,
          );
        }
        const rule: unknown = current[key];
        if (i < path.length - 1) {
          current = nestedShapeOf(rule);
        }
      });
    };
    const targetField =
      Array.isArray(rel.target) && rel.target.length
        ? lastPropertyKeyOf(rel.target)
        : 'unknown';
    const sourceField =
      Array.isArray(rel.source) && rel.source.length
        ? lastPropertyKeyOf(rel.source)
        : 'unknown';
    if (isRootSource) {
      checkPath(rel.source, targetField);
    }
    if (isRootTarget) {
      checkPath(rel.target, sourceField);
    }
  }
}
