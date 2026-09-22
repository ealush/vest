import { isArrayPrefix } from 'vest-utils';

export type PropertySegment = { type: 'property'; key: PropertyKey };
export type ItemSegment = { type: 'item'; binding: string };
export type SchemaPath = readonly (PropertySegment | ItemSegment)[];

export function propertySegment(key: PropertyKey): PropertySegment {
  return { type: 'property', key };
}

export function itemSegment(binding: string): ItemSegment {
  return { type: 'item', binding };
}

export function isPropertySegment(
  seg: PropertySegment | ItemSegment,
): seg is PropertySegment {
  return seg.type === 'property';
}

export function isItemSegment(
  seg: PropertySegment | ItemSegment,
): seg is ItemSegment {
  return seg.type === 'item';
}

export function pathToString(path: SchemaPath): string {
  return path
    .map(seg =>
      seg.type === 'property' ? String(seg.key) : `{item:${seg.binding}}`,
    )
    .join('.');
}

/** Whether two schema paths identify the same property/item sequence. */
export function schemaPathsEqual(a: SchemaPath, b: SchemaPath): boolean {
  return a.length === b.length && isArrayPrefix(a, b, schemaSegmentsEqual);
}

/**
 * Whether a schema path begins with a scope path. Item segments compare by
 * kind because their binding labels describe traversal rather than identity.
 */
export function isSchemaPathPrefixedBy(
  path: SchemaPath,
  prefix: SchemaPath,
): boolean {
  return isArrayPrefix(prefix, path, schemaScopeSegmentsMatch);
}

function schemaSegmentsEqual(
  left: SchemaPath[number],
  right: SchemaPath[number],
): boolean {
  if (left.type !== right.type) return false;
  return left.type === 'property'
    ? left.key === (right as PropertySegment).key
    : left.binding === (right as ItemSegment).binding;
}

function schemaScopeSegmentsMatch(
  prefix: SchemaPath[number],
  path: SchemaPath[number],
): boolean {
  if (prefix.type !== path.type) return false;
  return (
    prefix.type !== 'property' || prefix.key === (path as PropertySegment).key
  );
}
