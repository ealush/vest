import { isObject } from 'vest-utils';

import { ctx } from '../../enforceContext';
import type { RuleInstance } from '../../utils/RuleInstance';
import { RuleRunReturn } from '../../utils/RuleRunReturn';

import {
  findDangerousOwnKey,
  ownKeys,
  safeHasOwn,
  safeShallowCopy,
} from './schemaObjectUtils';
import type { ShapeType } from './shape';

/**
 * Validates that an object matches a schema loosely - all schema keys required, extra keys allowed.
 * Like shape() but permits additional properties not defined in the schema.
 *
 * @template T - The object type to validate
 * @param value - The object to validate
 * @param schema - Schema mapping keys to validation rules
 * @returns RuleRunReturn indicating success or failure
 *
 * @example
 * ```typescript
 * // Eager API
 * enforce({ name: 'John', age: 30, extra: 'allowed' })
 *   .loose({
 *     name: enforce.isString(),
 *     age: enforce.isNumber()
 *   }); // passes (extra key is ok)
 *
 * // Lazy API
 * const partialUserSchema = enforce.loose({
 *   name: enforce.isString(),
 *   email: enforce.isString()
 * });
 *
 * // All schema keys must be present and valid
 * partialUserSchema.test({ name: 'Jane', email: 'jane@example.com' }); // true
 * partialUserSchema.test({ name: 'Jane', email: 'jane@example.com', age: 30 }); // true (extra ok)
 * partialUserSchema.test({ name: 'Jane' }); // false (missing email)
 * ```
 */
// eslint-disable-next-line complexity
export function loose<T extends Record<string, any>>(
  value: T,
  schema: Record<string, any>,
): RuleRunReturn<T> {
  if (!isObject(value)) {
    return RuleRunReturn.Failing(value);
  }

  const dangerousSchemaKey = findDangerousOwnKey(schema);
  if (dangerousSchemaKey) {
    return {
      ...RuleRunReturn.Failing(value),
      path: [dangerousSchemaKey],
    };
  }

  const dangerousValueKey = findDangerousOwnKey(value);
  if (dangerousValueKey) {
    return {
      ...RuleRunReturn.Failing(value),
      path: [dangerousValueKey],
    };
  }

  const parsedValue: Record<string, any> = safeShallowCopy(value);

  for (const key of ownKeys(schema)) {
    const fieldValue = safeHasOwn(value, key) ? value[key] : undefined;
    const res = ctx.run({ value: fieldValue, set: true, meta: { key } }, () =>
      schema[key].run(fieldValue),
    );
    if (!res.pass) {
      const currentPath = res.path || [];
      const newRes = { ...res, path: [key, ...currentPath] };
      return newRes as RuleRunReturn<T>;
    }

    parsedValue[key] = res.type;
  }

  return RuleRunReturn.Passing(parsedValue as T);
}

// Types colocated with loose rule
export type LooseRuleInstance<S extends Record<string, RuleInstance<any>>> =
  RuleInstance<
    ShapeType<S> & Record<string, unknown>,
    [ShapeType<S> & Record<string, unknown>]
  >;

export type LooseShapeValue<S extends Record<string, RuleInstance<any>>> =
  ShapeType<S> & Record<string, unknown>;
