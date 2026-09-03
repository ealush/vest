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
import './record';
import './tuple';

import type { RuleInstance } from '../../utils/RuleInstance';
import { MultiTypeInput, MultiTypeInputArgs } from './schemaRulesTypes';

import type {
  IsArrayOfRuleInstance,
  LazyRuleInstance,
  LooseRuleInstance,
  OptionalRuleInstance,
  PartialRuleInstance,
  PickRuleInstance,
  OmitRuleInstance,
  ShapeRuleInstance,
  RecordRuleInstance,
  TupleRuleInstance,
} from './schemaRules';

/**
 * Type mappings for schema rule lazy API return types
 */
export type SchemaRuleLazyTypes = {
  isArrayOf: <Rules extends RuleInstance<any, any>[]>(
    ...rules: Rules
  ) => IsArrayOfRuleInstance<MultiTypeInput<Rules>, MultiTypeInputArgs<Rules>>;
  list: <Rules extends RuleInstance<any, any>[]>(
    ...rules: Rules
  ) => IsArrayOfRuleInstance<MultiTypeInput<Rules>, MultiTypeInputArgs<Rules>>;
  lazy: <T>(factory: () => RuleInstance<T, any>) => LazyRuleInstance<T>;
  loose: <S extends Record<string, RuleInstance<any>>>(
    schema: S,
  ) => LooseRuleInstance<S>;
  optional: <R extends RuleInstance<any>>(
    rule: R,
  ) => OptionalRuleInstance<R['infer']>;
  partial: <S extends Record<string, RuleInstance<any>>>(
    schema: S,
  ) => PartialRuleInstance<S>;
  pick: <S extends Record<string, RuleInstance<any>>, K extends keyof S>(
    schema: S,
    keys: readonly K[] | K,
  ) => PickRuleInstance<Pick<S, K>>;
  omit: <S extends Record<string, RuleInstance<any>>, K extends keyof S>(
    schema: S,
    keys: readonly K[] | K,
  ) => OmitRuleInstance<Omit<S, K>>;
  shape: <S extends Record<string, RuleInstance<any>>>(
    schema: S,
  ) => ShapeRuleInstance<S>;
  record: {
    <V extends RuleInstance<any, any>>(
      valueRule: V,
    ): RecordRuleInstance<never, V>;
    <K extends RuleInstance<string, any>, V extends RuleInstance<any, any>>(
      keyRule: K,
      valueRule: V,
    ): RecordRuleInstance<K, V>;
  };
  tuple: <Rules extends RuleInstance<any, any>[]>(
    ...rules: Rules
  ) => TupleRuleInstance<Rules>;
};
