import { RuleInstance } from 'enforceUtil';

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

// Specialized schema rule instance types (lazy builders)
// These make it easier to evolve schema rule output typing without
// touching every usage site. They are consumed by the lazy API to
// provide precise inference for shape/loose/partial.
export type ShapeRuleInstance<S extends Record<string, RuleInstance<any>>> = RuleInstance<
  ShapeType<S>,
  [ShapeType<S>]
>;

export type LooseRuleInstance<S extends Record<string, RuleInstance<any>>> = RuleInstance<
  ShapeType<S> & Record<string, unknown>,
  [ShapeType<S> & Record<string, unknown>]
>;

export type PartialRuleInstance<S extends Record<string, RuleInstance<any>>> = RuleInstance<
  Partial<ShapeType<S>>,
  [Partial<ShapeType<S>>]
>;

// Value shape aliases (shared by eager and lazy for consistency)
export type ShapeValue<S extends Record<string, RuleInstance<any>>> = ShapeType<S>;
export type LooseShapeValue<S extends Record<string, RuleInstance<any>>> = ShapeType<S> & Record<string, unknown>;
export type PartialShapeValue<S extends Record<string, RuleInstance<any>>> = Partial<ShapeType<S>>;
