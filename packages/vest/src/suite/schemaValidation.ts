import {
  parseAffectedFieldName,
  type SelectiveSchemaResult,
} from 'n4s/exports/internal';
import { makeResult } from 'vest-utils';
import { VestRuntime, Walker, type TIsolate } from 'vestjs-runtime';

import { VestTest } from '../core/isolate/IsolateTest/VestTest';

/**
 * Retention belongs to Vest's test tree. Reading actual failing tests makes
 * resetField(), remove(), reset(), and resume() authoritative; there is no
 * parallel error cache to invalidate.
 *
 * @param inclusion Evaluated region for this run: the resolved affected set
 * for changed() runs, the `only` names for inclusion-focused runs, or null
 * when nothing narrows execution (full runs re-evaluate everything, so no
 * retention is needed; skip-only runs follow destructive skip semantics).
 * @param skip Explicitly skipped names. Skip is destructive: failures it
 * touches are destroyed, never retained.
 */
export function useRetainedSchemaFailures(
  inclusion: readonly string[] | null,
  skip?: readonly string[] | null,
  rootReevaluated = false,
): SelectiveSchemaResult[] {
  if (inclusion === null) return [];
  const container = schemaValidationContainer();
  if (!container) return [];
  const policy: RetentionPolicy = {
    inclusion,
    rootReevaluated,
    skipped: skip ?? [],
  };
  return Walker.reduce<SelectiveSchemaResult[]>(
    container,
    (failures, node) =>
      makeResult.Ok(appendRetainedFailure(failures, node, policy)),
    [],
  );
}

type RetentionPolicy = {
  readonly inclusion: readonly string[];
  readonly rootReevaluated: boolean;
  readonly skipped: readonly string[];
};

function schemaValidationContainer(): TIsolate | undefined {
  const root = VestRuntime.useAvailableRoot();
  return root?.children?.find(child => child.data.schemaValidation === true);
}

function appendRetainedFailure(
  failures: SelectiveSchemaResult[],
  node: TIsolate,
  policy: RetentionPolicy,
): SelectiveSchemaResult[] {
  const retained = retainedFailureFor(node, policy);
  return retained === null ? failures : [...failures, retained];
}

function retainedFailureFor(
  node: TIsolate,
  policy: RetentionPolicy,
): SelectiveSchemaResult | null {
  if (!isLiveFailure(node)) {
    return null;
  }
  const identity = retainedIdentity(node);
  if (identity === null) return null;
  // Root issues (empty path) are global: no field inclusion can claim to
  // have re-evaluated them, and no field skip addresses them — unless the
  // current execution re-evaluated the root rule and passed, proving the
  // root verdict anew.
  if (identity.segments.length === 0) {
    return retainedRootFailure(identity, policy);
  }
  return isRevalidatedOrDestroyed(identity.segments, policy)
    ? null
    : { pass: false, message: identity.message, path: identity.segments };
}

function retainedRootFailure(
  identity: RetainedIdentity,
  policy: RetentionPolicy,
): SelectiveSchemaResult | null {
  if (policy.rootReevaluated) return null;
  return { pass: false, message: identity.message, path: [] };
}

function isRevalidatedOrDestroyed(
  segments: string[],
  policy: RetentionPolicy,
): boolean {
  return (
    policy.inclusion.some(field =>
      pathsOverlap(segments, affectedSegments(field)),
    ) ||
    policy.skipped.some(field =>
      pathsOverlap(segments, affectedSegments(field)),
    )
  );
}

/**
 * Structured identity of a retained schema failure. Synthesized schema tests
 * are keyed by their exact origin path and message (see schemaFailureKey),
 * so identity round-trips losslessly: a real field named `__root__`
 * (segments `['__root__']`) never collides with a root issue (segments `[]`),
 * and dotted record keys are never re-split. Nodes predating keyed identity
 * fall back to the legacy display-name reading.
 */
function retainedIdentity(node: TIsolate): RetainedIdentity | null {
  if (typeof node.key === 'string') {
    const keyed = parseKeyedIdentity(node.key);
    if (keyed !== null) return keyed;
  }
  if (!VestTest.is(node)) return null;
  const { fieldName, message } = VestTest.getData(node);
  return {
    segments: fieldName === '__root__' ? [] : fieldName.split('.'),
    message,
  };
}

type RetainedIdentity = {
  segments: string[];
  message: string | undefined;
};

function isLiveFailure(node: TIsolate): boolean {
  return VestTest.is(node) && VestTest.isFailing(node).unwrap();
}

function parseKeyedIdentity(key: string): RetainedIdentity | null {
  // Not a keyed schema identity — use the legacy display-name reading.
  const parsed = parseJsonKey(key);
  if (parsed === undefined || !Array.isArray(parsed)) return null;
  return keyedIdentityFrom(parsed);
}

function keyedIdentityFrom(parsed: unknown[]): RetainedIdentity | null {
  const [segments, message] = parsed;
  if (!isStringArray(segments) || !isOptionalString(message)) return null;
  return { message: message ?? undefined, segments };
}

function parseJsonKey(key: string): unknown {
  try {
    return JSON.parse(key);
  } catch {
    return undefined;
  }
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every(segment => typeof segment === 'string')
  );
}

function isOptionalString(value: unknown): value is string | null | undefined {
  return value === null || value === undefined || typeof value === 'string';
}

/** Canonical dotted affected names parsed to comparable segments. */
function affectedSegments(field: string): string[] {
  return parseAffectedFieldName(field).map(segment =>
    segment.type === 'property' ? String(segment.key) : String(segment.binding),
  );
}

/** Segment-wise overlap in either direction (containment counts). */
function pathsOverlap(a: readonly string[], b: readonly string[]): boolean {
  const length = Math.min(a.length, b.length);
  for (let index = 0; index < length; index++) {
    if (a[index] !== b[index]) return false;
  }
  return true;
}

export function schemaFailureField(result: SelectiveSchemaResult): string {
  return result.path?.length ? result.path.join('.') : '__root__';
}

/** Stable across changes in which other fields fail in the same run. */
export function schemaFailureKey(result: SelectiveSchemaResult): string {
  return JSON.stringify([result.path ?? [], result.message ?? null]);
}
