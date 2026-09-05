import { resolveAffectedPaths } from 'n4s';

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

/** Vest-specific adapter to n4s's canonical dependency planner. */
export function getAffectedFields(
  changedFields: string | string[],
  schema: unknown,
  data?: unknown,
): string[] {
  return resolveAffectedPaths(schema, changedFields, data);
}
