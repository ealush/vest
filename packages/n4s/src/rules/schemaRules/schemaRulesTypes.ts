import { RuleInstance } from '../../utils/RuleInstance';

import type { LooseShapeValue } from './loose';
import type { PartialShapeValue } from './partial';
import type { ShapeValue } from './shape';


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

export type MultiTypeInput<T extends RuleInstance<any, any>[]> =
  InferShape<T[number]> extends never ? unknown : InferShape<T[number]>;

// Schema rules for object validation
// Centralized mapping of schema rule names to their result value forms.
export type SchemaResultMap<S extends Record<string, RuleInstance<any>>> = {
  shape: ShapeValue<S>;
  loose: LooseShapeValue<S>;
  partial: PartialShapeValue<S>;
};

// Schema rules for array validation
export type ArraySchemaResultMap<S extends RuleInstance<any, any>[]> = {
  isArrayOf: MultiTypeInput<S>[];
};
