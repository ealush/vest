import type { RuleInstance } from '../../utils/RuleInstance';
import { RuleRunReturn } from '../../utils/RuleRunReturn';

import { loose } from './loose';
import { getDangerousOwnKey, ownKeys } from './schemaObjectUtils';

/**
 * Validates that an object matches a schema exactly - all keys required, no extra keys allowed.
 * Each field value is validated against its corresponding RuleInstance in the schema.
 */
export function shape<S extends Record<string, RuleInstance<any>>>(
  value: Record<string, unknown>,
  schema: S,
): RuleRunReturn<ShapeType<S>> {
  const baseRes = loose(value, schema);
  if (!baseRes.pass) {
    return baseRes;
  }

  const dangerousInputKey = getDangerousOwnKey(value);
  if (dangerousInputKey) {
    return {
      ...RuleRunReturn.Failing(value),
      path: [dangerousInputKey],
    } as RuleRunReturn<ShapeType<S>>;
  }

  const schemaKeys = new Set(ownKeys(schema as Record<string, unknown>));

  for (const key of ownKeys(value)) {
    if (!schemaKeys.has(key)) {
      return {
        ...RuleRunReturn.Failing(value),
        path: [key],
      } as RuleRunReturn<ShapeType<S>>;
    }
  }

  return RuleRunReturn.Passing(baseRes.type as ShapeType<S>);
}

// Types colocated with shape rule
export type InferShape<T> = T extends RuleInstance<infer R, any> ? R : never;

export type SchemaInfer<T extends Record<string, RuleInstance<any>>> = {
  [K in keyof T as undefined extends InferShape<T[K]> ? never : K]: InferShape<
    T[K]
  >;
} & {
  [K in keyof T as undefined extends InferShape<T[K]> ? K : never]?: InferShape<
    T[K]
  >;
};

export type ShapeType<T extends Record<string, RuleInstance<any>>> =
  SchemaInfer<T>;

export type ShapeRuleInstance<S extends Record<string, RuleInstance<any>>> =
  RuleInstance<ShapeType<S>, [ShapeType<S>]>;

export type ShapeValue<S extends Record<string, RuleInstance<any>>> =
  ShapeType<S>;

export type SchemaValidationRule = <
  S extends Record<string, RuleInstance<any>>,
>(
  value: Record<string, unknown>,
  schema: S,
) => RuleRunReturn<ShapeType<S>>;
