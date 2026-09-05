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
