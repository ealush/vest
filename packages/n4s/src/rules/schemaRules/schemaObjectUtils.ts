import { isObject, isUnsafeKey } from 'vest-utils';

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
 * Returns the first dangerous own key if present; otherwise null.
 */
export function findDangerousOwnKey(value: unknown): string | null {
  for (const key of ownKeys(value)) {
    if (isUnsafeKey(key)) {
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
    if (isUnsafeKey(key)) {
      continue;
    }

    output[key] = value[key];
  }

  return output;
}

/**
 * Returns true if both value and schema are plain objects (not arrays).
 */
export function isValidSchemaInput(value: unknown, schema: unknown): boolean {
  return (
    isObject(value) &&
    !Array.isArray(value) &&
    isObject(schema) &&
    !Array.isArray(schema)
  );
}

/**
 * Checks if the value or the schema contain any inherently dangerous keys natively.
 */
export function checkDangerousKeys<T>(
  value: T,
  schema: Record<string, any>,
): { pass: false; path: string[] } | null {
  const dangerousSchemaKey = findDangerousOwnKey(schema);
  if (dangerousSchemaKey) {
    return { pass: false, path: [dangerousSchemaKey] };
  }

  const dangerousValueKey = findDangerousOwnKey(value);
  if (dangerousValueKey) {
    return { pass: false, path: [dangerousValueKey] };
  }

  return null;
}

/**
 * Filters schema keys using a predicate, returning a new schema
 * containing only the keys for which the predicate returns true.
 */
export function filterSchemaKeys(
  schema: Record<string, any>,
  predicate: (key: string) => boolean,
): Record<string, any> {
  const filtered: Record<string, any> = {};
  if (!isObject(schema)) {
    return filtered;
  }
  for (const key of ownKeys(schema)) {
    if (predicate(key)) {
      filtered[key] = schema[key];
    }
  }
  return filtered;
}
