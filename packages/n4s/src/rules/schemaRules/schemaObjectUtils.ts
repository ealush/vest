import { isObject } from 'vest-utils';

/**
 * Keys that can mutate object prototypes when assigned.
 *
 * This set is intentionally tiny and lookup is O(1).
 */
const DANGEROUS_KEYS = new Set(['__proto__', 'prototype', 'constructor']);

/**
 * Returns only own enumerable keys for object-like values.
 *
 * Prototype keys are never traversed which prevents inherited-key surprises.
 */
export function ownKeys(value: unknown): string[] {
  if (!isObject(value)) {
    return [];
  }

  return Object.keys(value as Record<string, unknown>);
}

/**
 * Checks whether a key is known to be unsafe for object assignment/traversal.
 */
export function isDangerousKey(key: string): boolean {
  return DANGEROUS_KEYS.has(key);
}

/**
 * Returns the first dangerous own key if present; otherwise null.
 */
export function findDangerousOwnKey(value: unknown): string | null {
  for (const key of ownKeys(value)) {
    if (isDangerousKey(key)) {
      return key;
    }
  }

  return null;
}

/**
 * Produces a plain shallow sanitized copy that includes only own enumerable keys
 * and excludes dangerous keys. Prototype and non-enumerable properties are not preserved.
 */
export function safeShallowCopy(
  value: Record<string, any>,
): Record<string, any> {
  const output: Record<string, any> = {};

  for (const key of ownKeys(value)) {
    if (isDangerousKey(key)) {
      continue;
    }

    output[key] = value[key];
  }

  return output;
}
