import type { SchemaPath } from './SchemaPath';
import type { InternalRelationship } from './SchemaRelationship';

/**
 * Pure rebasing: prefixes non-rooted paths with given prefix.
 * Rooted paths (those that escaped via $.root) are left as-is.
 * Preserves internal rootedness flags across composition; stripping
 * is done only in public describe() output.
 */
export function rebaseRelationships(
  relationships: InternalRelationship[],
  prefix: SchemaPath,
): InternalRelationship[] {
  return relationships.map(rel => {
    // eslint-disable-line complexity
    const isRootSource = rel.__isRootSource === true;
    const isRootTarget = rel.__isRootTarget === true;
    const source = isRootSource ? rel.source : rebasePath(rel.source, prefix);
    const target = isRootTarget ? rel.target : rebasePath(rel.target, prefix);
    const rebased: InternalRelationship = {
      source,
      target,
      effect: rel.effect,
      ...(rel.metadata ? { metadata: { ...rel.metadata } } : {}),
      ...(isRootSource ? { __isRootSource: true as const } : {}),
      ...(isRootTarget ? { __isRootTarget: true as const } : {}),
    };
    return rebased;
  });
}

export function rebasePath(path: SchemaPath, prefix: SchemaPath): SchemaPath {
  return [...prefix, ...path];
}

/**
 * Rebase for array item case: injects item segment between prefix and child paths.
 */
export function rebaseRelationshipsForArray(
  relationships: InternalRelationship[],
  arrayProperty: string | symbol,
  itemBinding: string,
): InternalRelationship[] {
  const prefix: SchemaPath = [
    { type: 'property', key: arrayProperty },
    { type: 'item', binding: itemBinding },
  ];
  return rebaseRelationships(relationships, prefix);
}
