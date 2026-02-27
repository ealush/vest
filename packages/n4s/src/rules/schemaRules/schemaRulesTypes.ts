/**
 * Module: `src/rules/schemaRules/schemaRulesTypes.ts`.
 *
 * Provides `schemaRulesTypes`-related runtime and type utilities used by `n4s`.
 */
import { RuleInstance } from '../../utils/RuleInstance';

/**
 * Forces TypeScript to eagerly expand object type aliases in hover hints.
 */
export type Prettify<T> = { [K in keyof T]: T[K] } & {};

/** Extracts the OUTPUT type from a RuleInstance (what parse() returns). */
export type InferShape<T> = T extends RuleInstance<infer R, any> ? R : never;

/** Extracts the INPUT type from a RuleInstance (what parse() accepts). */
export type InferShapeInput<T> =
  T extends RuleInstance<any, [infer A, ...any[]]> ? A : never;

/**
 * True only when T is exactly `unknown` (not a union that includes unknown).
 * Used to prevent `unknown` fields from being wrongly classified as optional.
 */
type IsUnknown<T> = unknown extends T
  ? T extends unknown
    ? [T] extends [undefined]
      ? false
      : true
    : false
  : false;

/**
 * True when a field should be modelled as optional: its type explicitly includes
 * undefined (e.g. via `optional()`) but is NOT just the bare `unknown` type.
 */
type ShouldBeOptional<T> =
  IsUnknown<T> extends true ? false : undefined extends T ? true : false;

/** Maps a schema record to its OUTPUT type (post-coercion). */
export type SchemaInfer<T extends Record<string, RuleInstance<any>>> = Prettify<
  {
    [K in keyof T as ShouldBeOptional<InferShape<T[K]>> extends true
      ? never
      : K]: InferShape<T[K]>;
  } & {
    [K in keyof T as ShouldBeOptional<InferShape<T[K]>> extends true
      ? K
      : never]?: InferShape<T[K]>;
  }
>;

/** Maps a schema record to its INPUT type (pre-coercion). */
export type SchemaInput<T extends Record<string, RuleInstance<any>>> = Prettify<
  {
    [K in keyof T as ShouldBeOptional<InferShapeInput<T[K]>> extends true
      ? never
      : K]: InferShapeInput<T[K]>;
  } & {
    [K in keyof T as ShouldBeOptional<InferShapeInput<T[K]>> extends true
      ? K
      : never]?: InferShapeInput<T[K]>;
  }
>;

export type MultiTypeInput<T extends RuleInstance<any, any>[]> =
  InferShape<T[number]> extends never ? unknown : InferShape<T[number]>;

/** Extracts the input element type from rule instances (what the array accepts). */
export type MultiTypeInputArgs<T extends RuleInstance<any, any>[]> =
  InferShapeInput<T[number]> extends never
    ? unknown
    : InferShapeInput<T[number]>;
