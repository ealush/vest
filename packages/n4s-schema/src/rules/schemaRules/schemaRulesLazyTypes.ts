/**
 * Schema rules type declarations.
 * The actual ValueFirstRules declarations are colocated with each rule implementation.
 * This file just imports them to ensure they're included in the type system.
 */
import 'isArrayOf';
import 'loose';
import 'optional';
import 'partial';
import 'shape';

import type { RuleInstance } from 'RuleInstance';
import type {
  IsArrayOfRuleInstance,
  LooseRuleInstance,
  OptionalRuleInstance,
  PartialRuleInstance,
  ShapeRuleInstance,
} from 'schemaRules';

/**
 * Type mappings for schema rule lazy API return types
 */
export type SchemaRuleLazyTypes = {
  isArrayOf: <T>(...rules: any[]) => IsArrayOfRuleInstance<T>;
  loose: <S extends Record<string, RuleInstance<any>>>(
    schema: S,
  ) => LooseRuleInstance<S>;
  optional: <T>(rule: any) => OptionalRuleInstance<T>;
  partial: <S extends Record<string, RuleInstance<any>>>(
    schema: S,
  ) => PartialRuleInstance<S>;
  shape: <S extends Record<string, RuleInstance<any>>>(
    schema: S,
  ) => ShapeRuleInstance<S>;
};
