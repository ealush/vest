import { resolveAffectedPaths } from 'n4s/exports/internal';

/**
 * V1 accepts no options on `suite.changed()`. The type is intentionally
 * empty: AbortSignal-based cancellation is not a V1 feature, so no typed
 * overload may imply it. JavaScript callers passing an options object are
 * still rejected explicitly at runtime (see assertNoAbortSignal) instead of
 * being silently ignored.
 */
export type ChangedOptions = Record<string, never>;

/**
 * Runtime rejection for unsupported `suite.changed` options. Kept even
 * though the TypeScript surface accepts no options, so JavaScript misuse
 * fails explicitly rather than implying cancellation support.
 */
export function assertNoAbortSignal(options?: unknown): void {
  if (
    options !== null &&
    typeof options === 'object' &&
    (options as { signal?: unknown }).signal !== undefined
  ) {
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
