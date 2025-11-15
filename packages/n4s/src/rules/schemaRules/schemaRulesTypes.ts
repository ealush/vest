import { RuleInstance } from 'RuleInstance';
import type { LooseShapeValue } from 'loose';
import type { PartialShapeValue } from 'partial';
import type { ShapeValue } from 'shape';

export type InferShape<T> = T extends RuleInstance<infer R, any[]> ? R : never; // [FIXED]

export type SchemaInfer<T extends Record<string, RuleInstance<any, any[]>>> = {
  // [FIXED]
  [K in keyof T as undefined extends InferShape<T[K]> ? never : K]: InferShape<
    T[K]
  >;
} & {
  [K in keyof T as undefined extends InferShape<T[K]> ? K : never]?: Exclude<
    // Use Exclude for cleaner optional types
    InferShape<T[K]>,
    undefined
  >;
};

export type ShapeType<T extends Record<string, RuleInstance<any, any[]>>> = // [FIXED]
  SchemaInfer<T>;

export type MultiTypeInput<T extends RuleInstance<any, any>[]> =
  InferShape<T[number]> extends never ? unknown : InferShape<T[number]>;

// Schema rules for object validation
// Centralized mapping of schema rule names to their result value forms.
export type SchemaResultMap<
  S extends Record<string, RuleInstance<any, any[]>>,
> = {
  // [FIXED]
  shape: ShapeValue<S>;
  loose: LooseShapeValue<S>;
  partial: PartialShapeValue<S>;
};

// Schema rules for array validation
export type ArraySchemaResultMap<S extends RuleInstance<any, any[]>[]> = {
  // [FIXED]
  isArrayOf: MultiTypeInput<S>[];
};
