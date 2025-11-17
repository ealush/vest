/**
 * Schema rules type declarations.
 */
import './isArrayOf';
import './loose';
import './optional';
import './partial';
import './shape';

import type { RuleInstance } from '../../utils/RuleInstance';
import type {
  IsArrayOfRuleInstance,
  LooseRuleInstance,
  OptionalRuleInstance,
  PartialRuleInstance,
  ShapeRuleInstance,
} from './schemaRules';

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
