import { ctx } from 'enforceContext';
import type { ShapeType } from 'shape';

import type { RuleInstance } from 'enforceUtil';
import { Failing, Passing, RuleRunReturn } from 'enforceUtil';

// partial(value, schema) validates that:
// 1. value's keys are a subset of schema's keys (no extras)
// 2. Zero or more keys may be present (empty object is allowed)
// 3. For each provided key, the corresponding rule passes
// eslint-disable-next-line complexity
export function partial<T extends Record<string, any>>(
  value: T,
  schema: Record<string, any>,
): RuleRunReturn<T> {
  // Fail fast on extra properties
  for (const key in value) {
    if (!(key in schema)) {
      return Failing(value);
    }
  }

  // Validate provided keys; missing keys are allowed
  for (const key in schema) {
    if (key in value) {
      const fieldValue = value[key];
      const res = ctx.run({ value: fieldValue, set: true, meta: { key } }, () =>
        schema[key].run(fieldValue),
      );
      if (!res.pass) {
        return res as RuleRunReturn<T>;
      }
    }
  }

  return Passing(value);
}

// Types colocated with partial rule
export type PartialRuleInstance<S extends Record<string, RuleInstance<any>>> =
  RuleInstance<Partial<ShapeType<S>>, [Partial<ShapeType<S>>]>;

export type PartialShapeValue<S extends Record<string, RuleInstance<any>>> =
  Partial<ShapeType<S>>;
