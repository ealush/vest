import type { StandardSchemaV1 } from '@standard-schema/spec';

export function normalizeIssuePath(
  path: StandardSchemaV1.Issue['path'],
): PropertyKey[] {
  return (path ?? []).map(segment =>
    typeof segment === 'object' ? segment.key : segment,
  );
}

export function pathsEqual(
  left: readonly PropertyKey[],
  right: readonly PropertyKey[],
): boolean {
  return (
    left.length === right.length &&
    left.every((segment, index) => segment === right[index])
  );
}
