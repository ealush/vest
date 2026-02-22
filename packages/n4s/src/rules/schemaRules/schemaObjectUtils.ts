import { hasOwnProperty } from 'vest-utils';

const DANGEROUS_KEYS = new Set(['__proto__', 'prototype', 'constructor']);

/**
 * Security hardening: these keys can be used for prototype pollution attacks
 * when copied into regular JavaScript objects.
 */
export function isSafeObjectKey(key: string): boolean {
  return !DANGEROUS_KEYS.has(key);
}

/**
 * Returns own enumerable keys only (O(n)), avoiding prototype chain traversal.
 */
export function ownKeys(record: Record<string, unknown>): string[] {
  return Object.keys(record);
}

/**
 * Creates a shallow copy that excludes dangerous keys.
 */
export function createSafeObjectCopy(
  value: Record<string, unknown>,
): Record<string, unknown> {
  const output: Record<string, unknown> = {};

  for (const key of ownKeys(value)) {
    if (!isSafeObjectKey(key)) {
      continue;
    }
    output[key] = value[key];
  }

  return output;
}

/**
 * Returns the first dangerous key found on own enumerable keys, if any.
 */
export function getDangerousOwnKey(
  value: Record<string, unknown>,
): string | undefined {
  for (const key of ownKeys(value)) {
    if (!isSafeObjectKey(key)) {
      return key;
    }
  }

  return undefined;
}

/**
 * Safe own property check helper.
 */
export function hasOwn(record: Record<string, unknown>, key: string): boolean {
  return hasOwnProperty(record, key);
}
