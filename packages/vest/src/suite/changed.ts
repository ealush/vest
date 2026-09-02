import type { SchemaPath } from 'n4s/src/schema/SchemaPath';
import type { SchemaRelationship } from 'n4s/src/schema/SchemaRelationship';

const RESOLVED_RELATIONSHIPS = Symbol.for('vest:resolvedRelationships');

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
    // We treat any numeric string as item; property named '123' would be
    // ambiguous but rare and acceptable for changed() matching.
    if (/^\d+$/.test(part)) {
      segs.push({ type: 'item', binding: part });
    } else {
      segs.push({ type: 'property', key: part });
    }
  }
  return segs as SchemaPath;
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
 * We treat any item segment in pattern as wildcard matching any item segment in concrete.
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
    if (p.type !== c.type) return false;
    if (p.type === 'property') {
      if ((p as any).key !== (c as any).key) return false;
    } else {
      // item segment: pattern binding is wildcard (e.g., 'travelers.$item'), concrete binding is index
      // Consider match if both are items, regardless of binding value
      // For stricter, we could check that pattern binding's prefix matches concrete's array name,
      // but for now any item matches any item at same position
      continue;
    }
  }
  return true;
}

/**
 * Generates concrete target field names for a relationship given a concrete source field.
 * For same-item dependencies, the target's item binding should be replaced with the
 * concrete index from the source.
 *
 * Example: relationship source [travelers, $item, country] -> target [travelers, $item, passport]
 * changed 'travelers.1.country' (concrete [travelers, 1, country]) matches source
 * then target concrete is [travelers, 1, passport] -> 'travelers.1.passport'
 */
// eslint-disable-next-line complexity
function generateConcreteTarget(
  patternTarget: SchemaPath,
  patternSource: SchemaPath,
  concreteSource: SchemaPath,
): SchemaPath {
  const segs: SchemaPath[number][] = [];
  for (let i = 0; i < patternTarget.length; i++) {
    const tSeg = patternTarget[i];
    if (tSeg.type === 'item') {
      // Find corresponding item segment in patternSource and concreteSource
      // For same-item, the item binding at same position should be shared
      // Find item position in pattern
      const patternItemIndices: number[] = [];
      patternSource.forEach((seg, idx) => {
        if (seg.type === 'item') patternItemIndices.push(idx);
      });
      const targetItemPos = i;
      // Check if this item position corresponds to a source item at same depth
      // For same-item, source and target share same binding, so we can copy concrete's item binding
      const sourceItemAtSamePos = patternSource[targetItemPos];
      if (
        sourceItemAtSamePos &&
        sourceItemAtSamePos.type === 'item' &&
        concreteSource[targetItemPos]?.type === 'item'
      ) {
        segs.push({
          type: 'item',
          binding: (concreteSource[targetItemPos] as any).binding,
        });
      } else {
        // No corresponding source item, keep pattern's binding (should not happen for same-item)
        segs.push({ ...tSeg } as any);
      }
    } else {
      segs.push({ ...tSeg } as any);
    }
  }
  return segs as SchemaPath;
}

/**
 * Computes affected fields for given changed fields, using the relationship graph.
 * Handles direct dependents only (non-transitive), deduplicated, and same-item array.
 */
// eslint-disable-next-line complexity
export function getAffectedFields(
  changedFields: string | string[],
  schema: any,
  data?: any,
): string[] {
  const changedArray = Array.isArray(changedFields)
    ? changedFields
    : [changedFields];
  if (changedArray.length === 0) return [];

  const relationships: SchemaRelationship[] =
    (schema as any)?.[RESOLVED_RELATIONSHIPS] || [];

  if (relationships.length === 0) {
    // No graph, just return changed fields themselves (like only)
    return [...new Set(changedArray)];
  }

  // Parse changed fields to concrete paths
  const concreteChangedPaths = changedArray.map(f => ({
    field: f,
    path: parseFieldName(f),
  }));

  const affectedSet = new Set<string>();
  // Always include the changed fields themselves
  for (const cf of changedArray) {
    affectedSet.add(cf);
  }

  for (const rel of relationships) {
    for (const { field: _field, path: concretePath } of concreteChangedPaths) {
      // Check if concrete changed path matches relationship source pattern
      // For flat/nested: pattern [password] should match concrete [password] or [account,password] correctly
      // We need exact match, not prefix, for now
      if (pathMatchesPattern(rel.source as SchemaPath, concretePath)) {
        // For same-item array, generate concrete target with same index
        const hasItemInSource = (rel.source as SchemaPath).some(
          s => s.type === 'item',
        );
        const hasItemInTarget = (rel.target as SchemaPath).some(
          s => s.type === 'item',
        );

        if (hasItemInSource && hasItemInTarget) {
          // Same-item case: generate concrete target with index from concrete source
          const concreteTarget = generateConcreteTarget(
            rel.target as SchemaPath,
            rel.source as SchemaPath,
            concretePath,
          );
          affectedSet.add(pathToFieldName(concreteTarget));
        } else if (!hasItemInSource && hasItemInTarget) {
          // Root -> array item case: need to expand to all indices present in data
          // For V1, if data is available and target is array item, expand to all indices
          if (data) {
            const expanded = expandArrayTargets(rel.target as SchemaPath, data);
            for (const ef of expanded) affectedSet.add(ef);
          } else {
            // Without data, fallback to wildcard field name (not ideal, but for describe tests)
            // Use target path as is with $item binding -> convert to field name with *
            affectedSet.add(pathToFieldName(rel.target as SchemaPath));
          }
        } else {
          // Flat or nested non-array
          affectedSet.add(pathToFieldName(rel.target as SchemaPath));
        }
      }
    }
  }

  return Array.from(affectedSet);
}

/**
 * Expands an array-item target path to all concrete indices present in data.
 * Recursively expands every nested $item segment.
 * Example: target [travelers, $item, visa] with data {travelers: [{}, {}, {}]}
 * -> ['travelers.0.visa', 'travelers.1.visa', 'travelers.2.visa']
 * Nested: [groups, $item, members, $item, email] -> all group/member combos.
 */
function expandArrayTargets(targetPath: SchemaPath, data: any): string[] {
  const results: string[] = [];
  // eslint-disable-next-line complexity -- recursive DFS for nested $item expansion
  function dfs(pathIdx: number, dataNode: any, built: SchemaPath): void {
    if (pathIdx >= targetPath.length) {
      results.push(pathToFieldName(built as SchemaPath));
      return;
    }
    const seg = targetPath[pathIdx];
    if (seg.type === 'property') {
      dfs(pathIdx + 1, dataNode?.[(seg as any).key], [
        ...built,
        seg,
      ] as SchemaPath);
    } else {
      // item segment — dataNode should be the array at this position
      if (!Array.isArray(dataNode)) {
        dfs(pathIdx + 1, undefined, [...built, seg] as SchemaPath);
        return;
      }
      for (let i = 0; i < dataNode.length; i++) {
        dfs(pathIdx + 1, dataNode[i], [
          ...built,
          { type: 'item', binding: String(i) },
        ] as SchemaPath);
      }
    }
  }
  dfs(0, data, [] as unknown as SchemaPath);
  return results.length ? results : [pathToFieldName(targetPath)];
}
