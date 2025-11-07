import { loose } from 'loose';
import { hasOwnProperty } from 'vest-utils';

import type { RuleInstance } from 'RuleInstance';
import { RuleRunReturn } from 'RuleRunReturn';

export function shape<T extends Record<string, any>>(
  value: T,
  schema: Record<string, any>,
): RuleRunReturn<T> {
  const baseRes = loose(value, schema);
  if (!baseRes.pass) {
    return baseRes;
  }

  for (const key in value) {
    if (!hasOwnProperty(schema, key)) {
      return RuleRunReturn.Failing(value);
    }
  }

  return RuleRunReturn.Passing(value);
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

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace n4s {
    interface ValueFirstRules {
      shape: <T extends Record<string, any>>(
        value: T,
        schema: Record<string, RuleInstance<any>>,
      ) => RuleRunReturn<T>;
    }
  }
}
