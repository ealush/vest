import type {
  SchemaPath,
  ItemSegment,
  PropertySegment,
  SchemaRelationship,
} from 'n4s';
import { isPropertySegment } from 'n4s';
import { isArray, isNullish, isObject } from 'vest-utils';

const RESOLVED_RELATIONSHIPS = Symbol.for('vest:resolvedRelationships');

function slotsOf(value: unknown): Record<PropertyKey, unknown> {
  return value as unknown as Record<PropertyKey, unknown>;
}

/** @deferred v2 — suite.changed AbortSignal support deferred */
export type ChangedOptions = {
  signal?: AbortSignal;
};

/** @deferred v2 — suite.changed with AbortSignal abort deferred to v2 */
export function assertNoAbortSignal(options?: ChangedOptions): void {
  if (options?.signal !== undefined) {
    throw new Error('suite.changed({ signal: AbortSignal }) deferred to v2');
  }
}

/**
 * Parses a field name string like 'billing.country' or 'travelers[1].country'
 * or 'travelers.1.country' into a SchemaPath for matching.
 * Numeric segments are treated as item segments (array indices).
 */
export function parseFieldName(field: string): SchemaPath {
  // Normalize brackets to dots: travelers[1].country -> travelers.1.country
  const normalized = field.replace(/\[/g, '.').replace(/\]/g, '');
  const parts = normalized.split('.').filter(Boolean);
  const segs: SchemaPath[number][] = [];
  for (const part of parts) {
    // Numeric segment after an array property is considered an item
    // We treat every numeric string as item; property named '123' would be
    // ambiguous but rare and acceptable for changed() matching.
    if (/^\d+$/.test(part)) {
      segs.push({ type: 'item', binding: part });
    } else {
      segs.push({ type: 'property', key: part });
    }
  }
  return segs as SchemaPath;
}

/**
 * Canonical dotted form of a field name: brackets become dots, empty
 * segments are dropped ('travelers[1].country' -> 'travelers.1.country').
 * Single canonical implementation shared by matching and result filtering.
 */
export function normalizeFieldName(field: string): string {
  return pathToFieldName(parseFieldName(field));
}

export function pathToFieldName(path: SchemaPath): string {
  const parts: string[] = [];
  for (const seg of path) {
    if (seg.type === 'property') {
      parts.push(String(seg.key));
    } else {
      // For item, use bracket notation if previous part exists
      // We'll use dot notation for simplicity: travelers.1.country
      // But for concrete field names, we want dot + index
      parts.push(seg.binding);
    }
  }
  // Join with '.' — for item segments, we already have binding as index string
  // For schema paths with $item binding, this would produce 'travelers.travelers.$item.country'
  // but for concrete affected field names generated from relationships, we generate
  // concrete indices, so it's like 'travelers.1.country'
  return parts.join('.');
}

/**
 * Checks if a concrete field path matches a pattern path where item bindings are wildcards.
 * Pattern may have item with binding like 'travelers.$item', concrete has item with '1'.
 * We treat every item segment in pattern as wildcard matching every item segment in concrete.
 */
// eslint-disable-next-line complexity
function pathMatchesPattern(
  pattern: SchemaPath,
  concrete: SchemaPath,
): boolean {
  if (pattern.length !== concrete.length) return false;
  for (let i = 0; i < pattern.length; i++) {
    const p = pattern[i];
    const c = concrete[i];
    // A pattern item covers both array indices and dynamic record keys, so
    // it matches a concrete item as well as a concrete property (record key).
    if (p.type === 'item') continue;
    if (p.type !== c.type) return false;
    if (isPropertySegment(p) && isPropertySegment(c)) {
      if (p.key !== c.key) return false;
    } else {
      // item segment: pattern binding is wildcard (e.g., 'travelers.$item'), concrete binding is index
      // Consider match if both are items, regardless of binding value
      // For stricter, we could check that pattern binding's prefix matches concrete's array name,
      // but for now every item matches every item at same position
      continue;
    }
  }
  return true;
}

/**
 * Checks whether a concrete changed path is a strict parent prefix of a
 * relationship source pattern. Item segments in the pattern act as wildcards.
 * A parent-level changed path (e.g. 'profile' vs source [profile, country])
 * must pull in the relationship's targets, otherwise nested failures under
 * the parent are silently swallowed by exact-match focus.
 */
function isStrictPrefixOfSource(
  pattern: SchemaPath,
  concrete: SchemaPath,
): boolean {
  if (concrete.length === 0 || concrete.length >= pattern.length) return false;
  return concrete.every((seg, index) => segmentsMatch(pattern[index], seg));
}

function segmentsMatch(
  patternSeg: PropertySegment | ItemSegment | undefined,
  concreteSeg: PropertySegment | ItemSegment,
): boolean {
  if (patternSeg === undefined) {
    return false;
  }
  // Pattern items cover array indices and dynamic record keys alike.
  if (patternSeg.type === 'item') {
    return true;
  }
  return matchPropertySegments(patternSeg, concreteSeg);
}

function matchPropertySegments(
  patternSeg: PropertySegment | ItemSegment,
  concreteSeg: PropertySegment | ItemSegment,
): boolean {
  if (patternSeg.type !== concreteSeg.type) {
    return false;
  }
  if (patternSeg.type === 'property' && concreteSeg.type === 'property') {
    return patternSeg.key === concreteSeg.key;
  }
  return true;
}

/**
 * Returns the top-level key of a schema path (its first property segment).
 * Used as a binding-free fallback when an array target cannot be expanded
 * to concrete indices: affected names must never leak internal '$item'
 * bindings.
 */
function topLevelKeyOf(path: SchemaPath): string | null {
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
 *
 * Example: relationship source [travelers, $item, country] -> target [travelers, $item, passport]
 * changed 'travelers.1.country' (concrete [travelers, 1, country]) matches source
 * then target concrete is [travelers, 1, passport] -> 'travelers.1.passport'
 */
function resolveTargetItems(
  patternTarget: SchemaPath,
  patternSource: SchemaPath,
  concreteSource: SchemaPath,
): SchemaPath | null {
  const segs: (PropertySegment | ItemSegment)[] = [];
  for (let i = 0; i < patternTarget.length; i++) {
    const resolved = resolveTargetSegment(
      patternTarget[i],
      patternSource[i],
      concreteSource[i],
    );
    if (resolved === null) return null;
    segs.push(resolved);
  }
  return segs as SchemaPath;
}

function resolveTargetSegment(
  targetSeg: PropertySegment | ItemSegment | undefined,
  sourceSeg: PropertySegment | ItemSegment | undefined,
  concreteSeg: PropertySegment | ItemSegment | undefined,
): (PropertySegment | ItemSegment) | null {
  if (targetSeg === undefined) return null;
  if (targetSeg.type !== 'item') return { ...targetSeg };
  // For same-item, the item binding at the same position is shared
  // between source and target, so copy the concrete index.
  return resolveItemBinding(sourceSeg, concreteSeg);
}

function resolveItemBinding(
  sourceSeg: PropertySegment | ItemSegment | undefined,
  concreteSeg: PropertySegment | ItemSegment | undefined,
): (PropertySegment | ItemSegment) | null {
  if (sourceSeg === undefined || concreteSeg === undefined) return null;
  if (sourceSeg.type !== 'item') return null;
  // Array indices stay items; dynamic record keys resolve to the concrete
  // property so targets read as 'dictionary.home.state', not '$item'.
  if (concreteSeg.type === 'item') {
    const resolved: ItemSegment = {
      type: 'item',
      binding: concreteSeg.binding,
    };
    return resolved;
  }
  return { ...concreteSeg };
}

/**
 * Adds a relationship's targets to the affected set, concretized with the
 * concrete changed source when possible. Array targets without a usable
 * concrete index expand from run data; when expansion is impossible (no
 * data) they fall back to the top-level key — never '$item' bindings.
 */
function addRelationshipTargets(
  rel: SchemaRelationship,
  concreteSource: SchemaPath,
  data: unknown,
  affectedSet: Set<string>,
): void {
  const target = rel.target as SchemaPath;
  if (!target.some(seg => seg.type === 'item')) {
    affectedSet.add(pathToFieldName(target));
    return;
  }
  addArrayTargetFields(rel, concreteSource, data, affectedSet);
}

function addArrayTargetFields(
  rel: SchemaRelationship,
  concreteSource: SchemaPath,
  data: unknown,
  affectedSet: Set<string>,
): void {
  const target = rel.target as SchemaPath;
  const resolved = resolveTargetItems(
    target,
    rel.source as SchemaPath,
    concreteSource,
  );
  if (resolved) {
    affectedSet.add(pathToFieldName(resolved));
    return;
  }
  addUnresolvedArrayTarget(target, data, affectedSet);
}

function addUnresolvedArrayTarget(
  target: SchemaPath,
  data: unknown,
  affectedSet: Set<string>,
): void {
  if (isNullish(data)) {
    addTopLevelFallback(target, affectedSet);
    return;
  }
  const expanded = expandArrayTargets(target, data);
  for (const field of expanded) affectedSet.add(field);
}

function addTopLevelFallback(
  target: SchemaPath,
  affectedSet: Set<string>,
): void {
  const top = topLevelKeyOf(target);
  if (top) affectedSet.add(top);
}

/**
 * Computes affected fields for given changed fields, using the relationship graph.
 * Handles direct dependents only (non-transitive), deduplicated, and same-item array.
 */
// eslint-disable-next-line complexity
export function getAffectedFields(
  changedFields: string | string[],
  schema: unknown,
  data?: unknown,
): string[] {
  const changedArray = Array.isArray(changedFields)
    ? changedFields
    : [changedFields];
  if (changedArray.length === 0) return [];

  const relationships: SchemaRelationship[] =
    (slotsOf(schema)?.[RESOLVED_RELATIONSHIPS] as
      | SchemaRelationship[]
      | undefined) || [];

  if (relationships.length === 0) {
    // No graph, just return changed fields themselves (like only)
    return [...new Set(changedArray)];
  }

  // Parse changed fields to concrete paths
  const concreteChangedPaths = changedArray.map(f => ({
    field: f,
    path: parseFieldName(f),
  }));

  // Always include the changed fields themselves
  const affectedSet = new Set<string>(changedArray);

  collectRelationshipTargets(
    relationships,
    concreteChangedPaths,
    data,
    affectedSet,
  );

  return Array.from(affectedSet);
}

function collectRelationshipTargets(
  relationships: SchemaRelationship[],
  concreteChangedPaths: { field: string; path: SchemaPath }[],
  data: unknown,
  affectedSet: Set<string>,
): void {
  for (const rel of relationships) {
    for (const { field: _field, path: concretePath } of concreteChangedPaths) {
      // Check if concrete changed path matches relationship source pattern
      if (pathMatchesPattern(rel.source as SchemaPath, concretePath)) {
        addRelationshipTargets(rel, concretePath, data, affectedSet);
      } else if (
        isStrictPrefixOfSource(rel.source as SchemaPath, concretePath)
      ) {
        // Parent-level changed path (e.g. 'profile' vs source
        // [profile, country]): pull in the relationship's targets,
        // concretized from run data when indices are needed.
        addRelationshipTargets(rel, concretePath, data, affectedSet);
      }
    }
  }
}

/**
 * Expands an array-item target path to all concrete indices present in data.
 * Recursively expands every nested $item segment.
 * Example: target [travelers, $item, visa] with data {travelers: [{}, {}, {}]}
 * -> ['travelers.0.visa', 'travelers.1.visa', 'travelers.2.visa']
 * Nested: [groups, $item, members, $item, email] -> all group/member combos.
 */
function expandArrayTargets(targetPath: SchemaPath, data: unknown): string[] {
  const results: string[] = [];
  function dfs(pathIdx: number, dataNode: unknown, built: SchemaPath): void {
    if (pathIdx >= targetPath.length) {
      results.push(pathToFieldName(built as SchemaPath));
      return;
    }
    const seg = targetPath[pathIdx];
    if (isPropertySegment(seg)) {
      const child: unknown = isObject(dataNode)
        ? slotsOf(dataNode)[seg.key]
        : undefined;
      dfs(pathIdx + 1, child, [...built, seg] as SchemaPath);
    } else {
      dfsItemSegment(pathIdx, dataNode, built);
    }
    // Without backing data the index cannot be concretized: skip the
    // branch instead of leaking internal '$item' bindings.
  }
  function dfsItemSegment(
    pathIdx: number,
    dataNode: unknown,
    built: SchemaPath,
  ): void {
    if (isArray(dataNode)) {
      // item segment over an array — expand every index.
      for (let i = 0; i < dataNode.length; i++) {
        dfs(pathIdx + 1, dataNode[i], [
          ...built,
          { type: 'item', binding: String(i) },
        ] as SchemaPath);
      }
    } else if (isObject(dataNode)) {
      // item segment over a record — expand every dynamic key as a
      // concrete property so affected names never leak '$item' bindings.
      for (const key of Object.keys(dataNode)) {
        dfs(pathIdx + 1, (dataNode as Record<string, unknown>)[key], [
          ...built,
          { type: 'property', key },
        ] as SchemaPath);
      }
    }
  }
  dfs(0, data, [] as unknown as SchemaPath);
  if (results.length) return results;
  // Index expansion was impossible (no data): fall back to the top-level
  // key so affected names never contain internal bindings.
  const top = topLevelKeyOf(targetPath);
  return top ? [top] : [];
}
