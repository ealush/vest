import { resolveAffectedPaths } from 'n4s/exports/internal';

/** Vest-specific adapter to n4s's canonical dependency planner. */
export function getAffectedFields(
  changedFields: string | string[],
  schema: unknown,
  data?: unknown,
): string[] {
  return resolveAffectedPaths(schema, changedFields, data);
}
