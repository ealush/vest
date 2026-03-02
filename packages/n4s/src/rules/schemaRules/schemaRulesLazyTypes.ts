/**
 * Schema rules type declarations.
 */
import './isArrayOf';
import './loose';
import './optional';
import './partial';
import './pick';
import './omit';
import './shape';

import type { RuleInstance } from '../../utils/RuleInstance';
import { MultiTypeInput, MultiTypeInputArgs } from './schemaRulesTypes';

import type {
  IsArrayOfRuleInstance,
  LooseRuleInstance,
  OptionalRuleInstance,
  PartialRuleInstance,
  PickRuleInstance,
  OmitRuleInstance,
  ShapeRuleInstance,
} from './schemaRules';

/**
 * Type mappings for schema rule lazy API return types
 */
export type SchemaRuleLazyTypes = {
  isArrayOf: <Rules extends RuleInstance<any, any>[]>(
    ...rules: Rules
  ) => IsArrayOfRuleInstance<MultiTypeInput<Rules>, MultiTypeInputArgs<Rules>>;
  loose: <S extends Record<string, RuleInstance<any>>>(
    schema: S,
  ) => LooseRuleInstance<S>;
  optional: <R extends RuleInstance<any>>(
    rule: R,
  ) => OptionalRuleInstance<R['infer']>;
  partial: <S extends Record<string, RuleInstance<any>>>(
    schema: S,
  ) => PartialRuleInstance<S>;
  pick: <S extends Record<string, RuleInstance<any>>>(
    schema: S,
    keys: string[] | string,
  ) => PickRuleInstance<S>;
  omit: <S extends Record<string, RuleInstance<any>>>(
    schema: S,
    keys: string[] | string,
  ) => OmitRuleInstance<S>;
  shape: <S extends Record<string, RuleInstance<any>>>(
    schema: S,
  ) => ShapeRuleInstance<S>;
};
