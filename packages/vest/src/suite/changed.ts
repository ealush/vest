import { resolveAffectedPaths } from 'n4s/exports/internal';

/**
 * Runtime rejection for unsupported `suite.changed` options. V1 accepts no
 * options: the TypeScript signatures take only the changed fields, so any
 * defined second argument is JavaScript misuse. A `signal` fails with the
 * deferred-to-v2 message; anything else fails as an unsupported argument
 * instead of being silently ignored.
 */
export function assertNoAbortSignal(options?: unknown): void {
  if (options === undefined) return;
  if (
    options !== null &&
    typeof options === 'object' &&
    (options as { signal?: unknown }).signal !== undefined
  ) {
    throw new Error('suite.changed({ signal: AbortSignal }) deferred to v2');
  }
  throw new Error('suite.changed() accepts no options in V1');
}

/** Vest-specific adapter to n4s's canonical dependency planner. */
export function getAffectedFields(
  changedFields: string | string[],
  schema: unknown,
  data?: unknown,
): string[] {
  return resolveAffectedPaths(schema, changedFields, data);
}
