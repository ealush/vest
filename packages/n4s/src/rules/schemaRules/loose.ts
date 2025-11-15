import type { RuleInstance } from 'RuleInstance';
import { RuleRunReturn } from 'RuleRunReturn';
import { ctx } from 'enforceContext';
import type { ShapeType } from 'schemaRulesTypes';

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
 * .loose({
 * name: enforce.isString(),
 * age: enforce.isNumber()
 * }); // passes (extra key is ok)
 *
 * // Lazy API
 * const partialUserSchema = enforce.loose({
 * name: enforce.isString(),
 * email: enforce.isString()
 * });
 *
 * // All schema keys must be present and valid
 * partialUserSchema.test({ name: 'Jane', email: 'jane@example.com' }); // true
 * partialUserSchema.test({ name: 'Jane', email: 'jane@example.com', age: 30 }); // true (extra ok)
 * partialUserSchema.test({ name: 'Jane' }); // false (missing email)
 * ```
 */
export function loose<T extends Record<string, any>>(
  value: T,
  schema: Record<string, RuleInstance<any, any[]>>,
): RuleRunReturn<T> {
  for (const key in schema) {
    const fieldValue = key in value ? value[key] : undefined;
    const res = ctx.run({ value: fieldValue, set: true, meta: { key } }, () =>
      schema[key].run(fieldValue),
    );
    if (!res.pass) {
      return res as RuleRunReturn<T>;
    }
  }
  return RuleRunReturn.Passing(value);
}

// Types colocated with loose rule
export type LooseRuleInstance<
  S extends Record<string, RuleInstance<any, any[]>>,
> = RuleInstance<
  ShapeType<S> & Record<string, unknown>,
  [ShapeType<S> & Record<string, unknown>]
>;

export type LooseShapeValue<
  S extends Record<string, RuleInstance<any, any[]>>,
> = ShapeType<S> & Record<string, unknown>;
