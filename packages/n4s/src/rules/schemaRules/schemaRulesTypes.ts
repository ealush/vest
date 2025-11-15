import { RuleInstance } from 'RuleInstance';
import type { LooseShapeValue } from 'loose';
import type { PartialShapeValue } from 'partial';
import type { ShapeValue } from 'shape';

type Simplify<T> = { [K in keyof T]: T[K] } & {};

type SchemaRuleOutput<T> = T extends { infer: infer R } ? R : never;

type SchemaRequiredPart<S extends Record<string, RuleInstance<any, any[]>>> = {
  [K in keyof S as undefined extends SchemaRuleOutput<S[K]> ? never : K]:
    SchemaRuleOutput<S[K]>;
};

type SchemaOptionalPart<S extends Record<string, RuleInstance<any, any[]>>> = {
  [K in keyof S as undefined extends SchemaRuleOutput<S[K]> ? K : never]?: Exclude<
    SchemaRuleOutput<S[K]>,
    undefined
  >;
};

export type SchemaInfer<S extends Record<string, RuleInstance<any, any[]>>> = Simplify<
  SchemaRequiredPart<S> & SchemaOptionalPart<S>
>;

export type ShapeType<S extends Record<string, RuleInstance<any, any[]>>> = SchemaInfer<S>;

export type MultiTypeInput<T extends RuleInstance<any, any[]>[]> =
  SchemaRuleOutput<T[number]> extends never
    ? unknown
    : SchemaRuleOutput<T[number]>;

// Schema rules for object validation
// Centralized mapping of schema rule names to their result value forms.
export type SchemaResultMap<
  S extends Record<string, RuleInstance<any, any[]>>,
> = {
  shape: ShapeValue<S>;
  loose: LooseShapeValue<S>;
  partial: PartialShapeValue<S>;
};

// Schema rules for array validation
export type ArraySchemaResultMap<S extends RuleInstance<any, any[]>[]> = {
  isArrayOf: MultiTypeInput<S>[];
};
