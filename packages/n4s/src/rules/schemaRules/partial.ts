import { hasOwnProperty, isObject } from 'vest-utils';

import { ctx } from '../../enforceContext';
import type { RuleInstance } from '../../utils/RuleInstance';
import { RuleRunReturn } from '../../utils/RuleRunReturn';

import {
  ownKeys,
  rejectDangerousKeys,
  safeShallowCopy,
} from './schemaObjectUtils';
import type { ShapeType } from './shape';

/**
 * Checks if value has any keys not present in schema.
 */
function getFirstExtraKey<T extends Record<string, any>>(
  value: T,
  schema: Record<string, any>,
): string | null {
  for (const key of ownKeys(value)) {
    if (!hasOwnProperty(schema, key)) {
      return key;
    }
  }

  return null;
}

type ParsedKeysResult<T extends Record<string, any>> =
  | { ok: true; parsedEntries: Record<string, any> }
  | { ok: false; result: RuleRunReturn<T> };

/**
 * Validates provided keys against their schema rules and returns parsed entries.
 *
 * Missing keys are allowed (partial validation).
 */
function validateProvidedKeys<T extends Record<string, any>>(
  value: T,
  schema: Record<string, any>,
): ParsedKeysResult<T> {
  const parsedEntries: Record<string, any> = {};

  for (const key of ownKeys(schema)) {
    if (hasOwnProperty(value, key)) {
      const fieldValue = value[key];
      const res = ctx.run({ value: fieldValue, set: true, meta: { key } }, () =>
        schema[key].run(fieldValue),
      );
      if (!res.pass) {
        const currentPath = res.path || [];
        const result = RuleRunReturn.Failing(value);
        result.message = res.message;
        result.path = [key, ...currentPath];
        result.type = res.type as T;

        return { ok: false, result };
      }

      parsedEntries[key] = res.type;
    }
  }

  return { ok: true, parsedEntries };
}

/**
 * partial(value, schema) validates that:
 * 1. value's keys are a subset of schema's keys (no extras)
 * 2. Zero or more keys may be present (empty object is allowed)
 * 3. For each provided key, the corresponding rule passes
 */
/**
 * Validates that an object partially matches a schema - schema keys are optional, no extra keys allowed.
 * All provided keys must exist in schema and pass their validation rules.
 * Missing keys are allowed (making all fields optional).
 *
 * @template T - The object type to validate
 * @param value - The object to validate
 * @param schema - Schema mapping keys to validation rules
 * @returns RuleRunReturn indicating success or failure
 *
 * @example
 * ```typescript
 * // Eager API
 * enforce({ name: 'John' })
 *   .partial({
 *     name: enforce.isString(),
 *     age: enforce.isNumber(),
 *     email: enforce.isString()
 *   }); // passes (age and email are optional)
 *
 * // Lazy API
 * const updateSchema = enforce.partial({
 *   name: enforce.isString(),
 *   email: enforce.isString().matches(/@/),
 *   age: enforce.isNumber()
 * });
 *
 * updateSchema.test({}); // true (all fields optional)
 * updateSchema.test({ name: 'Jane' }); // true (partial update)
 * updateSchema.test({ name: 'Jane', email: 'jane@example.com' }); // true
 * updateSchema.test({ name: 'Jane', extra: 'x' }); // false (extra key not in schema)
 * ```
 */

export function partial<T extends Record<string, any>>(
  value: T,
  schema: Record<string, any>,
): RuleRunReturn<T> {
  if (!isObject(value)) {
    return RuleRunReturn.Failing(value);
  }

  const rejected = rejectDangerousKeys(value, schema);
  if (rejected) {
    return rejected;
  }

  const extraKey = getFirstExtraKey(value, schema);
  if (extraKey) {
    const result = RuleRunReturn.Failing(value);
    result.path = [extraKey];
    return result;
  }

  const parsedValue = safeShallowCopy(value);
  const parsedEntriesResult = validateProvidedKeys(value, schema);
  if (!parsedEntriesResult.ok) {
    return parsedEntriesResult.result;
  }

  return RuleRunReturn.Passing({
    ...parsedValue,
    ...parsedEntriesResult.parsedEntries,
  } as T);
}

// Types colocated with partial rule
export type PartialRuleInstance<S extends Record<string, RuleInstance<any>>> =
  RuleInstance<Partial<ShapeType<S>>, [Partial<ShapeType<S>>]>;

export type PartialShapeValue<S extends Record<string, RuleInstance<any>>> =
  Partial<ShapeType<S>>;
