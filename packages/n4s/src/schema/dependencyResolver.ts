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
  normalizeResolverResult,
} from './scopeProxy';
import type { Scope } from './scopeProxy';

// Symbols for storing unresolved deps on RuleInstance — must use Symbol.for to match chainBuilder
export const UNRESOLVED_DEPS = Symbol.for('vest:unresolvedDeps');
export const RESOLVED_RELATIONSHIPS = Symbol.for('vest:resolvedRelationships');

export type UnresolvedDep = {
  resolver: (scope: Scope) => unknown;
  isRevalidates: boolean;
};

/**
 * Collects unresolved deps from a field RuleInstance.
 */
export function getUnresolvedDeps(
  rule: RuleInstance<unknown, unknown[]>,
): UnresolvedDep[] {
  return ((rule as unknown as Record<symbol, unknown>)[UNRESOLVED_DEPS] as UnresolvedDep[]) || [];
}

export function setUnresolvedDeps(
  rule: RuleInstance<unknown, unknown[]>,
  deps: UnresolvedDep[],
): void {
  (rule as unknown as Record<symbol, unknown>)[UNRESOLVED_DEPS] = deps as unknown;
}

export function getResolvedRelationships(
  rule: RuleInstance<unknown, unknown[]>,
): SchemaRelationship[] {
  return ((rule as unknown as Record<symbol, unknown>)[RESOLVED_RELATIONSHIPS] as SchemaRelationship[]) || [];
}

export function setResolvedRelationships(
  rule: RuleInstance<unknown, unknown[]>,
  rels: SchemaRelationship[],
): void {
  (rule as unknown as Record<symbol, unknown>)[RESOLVED_RELATIONSHIPS] = rels as unknown;
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

    const unresolved = getUnresolvedDeps(fieldRule as unknown as RuleInstance<unknown, unknown[]>);
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

      const refs = normalizeResolverResult(result);
      if (refs.length === 0 && result !== undefined) {
        throw new EnforceSchemaError(
          `EnforceSchemaError: "${String(fieldKey)}" dependsOn resolver must return a dependency ref (e.g., $ => $.other) or array of refs, got ${String(result)}`,
        );
      }
      if (Array.isArray(result) && refs.length !== (result as unknown[]).length) {
        throw new EnforceSchemaError(
          `EnforceSchemaError: "${String(fieldKey)}" dependsOn resolver array contains non-dependency values`,
        );
      }

      for (const ref of refs) {
        let sourcePath: SchemaPath = ref.path;
        const isRoot = ref.isRoot === true;

        // Self-dependency normalization: $.self means the field itself
        // e.g., enforce.isString().dependsOn($ => $.self) inside field "a"
        // resolves to source [self] at scopePath prefix. Map "self" to target.
        if (
          sourcePath.length > 0 &&
          sourcePath[sourcePath.length - 1].type === 'property' &&
          String((sourcePath[sourcePath.length - 1] as unknown as PropertySegment).key) === 'self'
        ) {
          // Single self: $.self => owning field
          if (
            sourcePath.length === scopePath.length + 1 &&
            isPathPrefixedBy(sourcePath.slice(0, -1), scopePath)
          ) {
            sourcePath = targetPath;
          } else {
            // $.self.foo etc. — treat as error, will be validated as unknown
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

        if (dep.isRevalidates) {
          // revalidates: fieldKey revalidates(target)  =>  target dependsOn fieldKey
          // So source is current field, target is the referenced field
          const revalidatedTarget = sourcePath;
          const revalidatedSource: SchemaPath = targetPath;
          const revalidatedRel: InternalRelationship = isRoot
            ? {
                source: revalidatedSource,
                target: revalidatedTarget,
                effect: 'invalidate',
                __isRootTarget: true,
              }
            : {
                source: revalidatedSource,
                target: revalidatedTarget,
                effect: 'invalidate',
              };
          relationships.push(revalidatedRel);
        } else {
          relationships.push(rel);
        }
      }
    }
  }

  return relationships;
}

// eslint-disable-next-line complexity
function validateSourceExists(
  sourcePath: SchemaPath,
  rootShape: Record<PropertyKey, unknown>,
  targetField: string,
  scopePath: SchemaPath,
): void {
  let current: Record<PropertyKey, unknown> = rootShape as unknown as Record<PropertyKey, unknown>;
  // Walk to scopePath to find the containing shape
  for (const seg of scopePath) {
    if (seg.type === 'property') {
      const next = (current as Record<PropertyKey, unknown>)[seg.key as PropertyKey];
      if (next && typeof next === 'object' && '__schema' in (next as object)) {
        current = (next as unknown as { __schema: Record<PropertyKey, unknown> }).__schema;
      } else if (next && typeof next === 'object') {
        current = next as Record<PropertyKey, unknown>;
      } else {
        return;
      }
    } else if (seg.type === 'item') {
      if (current && (current as unknown as Record<PropertyKey, unknown>).__itemSchema) {
        current = (current as unknown as { __itemSchema: Record<PropertyKey, unknown> }).__itemSchema as Record<PropertyKey, unknown>;
      }
    }
  }

  const isRooted = !isPathPrefixedBy(sourcePath, scopePath);

  // Scalar-descendant check: walk sourcePath intermediates and ensure each
  // prefix before the next property is a shape-like (has __schema), not a scalar.
  // For path [obj, leaf] where obj is string, the field `obj` scalar has a child `leaf` → error.
  // We check from the effective root of sourcePath.
  const sourceRoot: Record<PropertyKey, unknown> = (isRooted ? rootShape : current) as Record<PropertyKey, unknown>;
  let walkShape: Record<PropertyKey, unknown> | null = sourceRoot as unknown as Record<PropertyKey, unknown> | null;
  // For non-rooted paths, strip scopePath prefix to get relative path within current scope
  const relativePath: SchemaPath = isRooted
    ? sourcePath
    : sourcePath.slice(scopePath.length);

  for (let i = 0; i < relativePath.length - 1; i++) {
    const seg = relativePath[i];
    if (seg.type !== 'property') continue;
    const rule = (walkShape as Record<PropertyKey, unknown>)?.[seg.key as string];
    if (!rule) continue;
    const isShapeLike =
      rule &&
      typeof rule === 'object' &&
      ('__schema' in rule ||
        Symbol.for('vest:resolvedRelationships') in rule ||
        Symbol.for('vest:itemSchema') in rule);
    if (!isShapeLike) {
      // This segment is scalar but has a descendant — invalid
      const descendant = String((relativePath[relativePath.length - 1] as unknown as PropertySegment).key);
      const scalarKey = String(seg.key);
      throw new EnforceSchemaError(
        `EnforceSchemaError: "${targetField}" depends on "${scalarKey}.${descendant}" but "${scalarKey}" is a scalar field and has no child "${descendant}"`,
      );
    }
    // Descend into shape for next iteration
    if ((rule as unknown as { __schema?: Record<PropertyKey, unknown> }).__schema) {
      walkShape = (rule as unknown as { __schema: Record<PropertyKey, unknown> }).__schema;
    } else if ((rule as unknown as Record<symbol, unknown>)[Symbol.for('vest:itemSchema')]) {
      const itemSchema = (rule as unknown as Record<symbol, unknown>)[Symbol.for('vest:itemSchema')] as unknown as Record<PropertyKey, unknown>;
      walkShape = (itemSchema as unknown as { __schema?: Record<PropertyKey, unknown> })?.__schema ?? itemSchema;
    } else {
      walkShape = null;
    }
  }

  const shapeToCheck: Record<PropertyKey, unknown> = isRooted ? rootShape : current;
  // For scalar-descendant with chained path, leaf already handled above;
  // for simple path, check leaf existence.
  // Resolve the immediate parent shape for leaf check
  let parentShape: Record<PropertyKey, unknown> | null = sourceRoot as unknown as Record<PropertyKey, unknown> | null;
  if (relativePath.length > 1) {
    // Walk to parent of leaf
    for (let i = 0; i < relativePath.length - 1; i++) {
      const seg = relativePath[i];
      if (seg.type !== 'property') continue;
      const rule = (parentShape as Record<PropertyKey, unknown>)?.[seg.key as string] as Record<PropertyKey, unknown> & {
        __schema?: Record<PropertyKey, unknown>;
        [key: symbol]: unknown;
      };
      if ((rule as unknown as { __schema?: Record<PropertyKey, unknown> })?.__schema) parentShape = (rule as unknown as { __schema: Record<PropertyKey, unknown> }).__schema;
      else if ((rule as unknown as Record<symbol, unknown>)[Symbol.for('vest:itemSchema')])
        parentShape = ((rule as unknown as Record<symbol, unknown>)[Symbol.for('vest:itemSchema')] as unknown as { __schema?: Record<PropertyKey, unknown> })?.__schema ?? parentShape;
      else parentShape = null;
    }
  } else {
    parentShape = shapeToCheck as Record<PropertyKey, unknown> | null;
  }
  const keyToCheck = sourcePath[sourcePath.length - 1];
  if (!keyToCheck || keyToCheck.type !== 'property') return;

  const checkShape = (parentShape ?? shapeToCheck) as Record<PropertyKey, unknown>;
  const exists = Object.prototype.hasOwnProperty.call(
    checkShape,
    keyToCheck.key as string,
  );
  if (!exists) {
    const suggestion = findClosestKey(
      String(keyToCheck.key),
      Object.keys(checkShape),
    );
    let msg = `EnforceSchemaError: "${targetField}" depends on unknown field "${String(keyToCheck.key)}"`;
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
    if (a[i].type === 'property' && (a[i] as unknown as PropertySegment).key !== (b[i] as unknown as PropertySegment).key)
      return false;
    if (a[i].type === 'item' && (a[i] as unknown as ItemSegment).binding !== (b[i] as unknown as ItemSegment).binding)
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
      (path[i] as unknown as PropertySegment).key !== (prefix[i] as unknown as PropertySegment).key
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
