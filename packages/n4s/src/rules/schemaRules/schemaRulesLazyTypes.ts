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

import type {
  DescribeResult,
  RuleInstance,
  ScopeHandle,
} from '../../utils/RuleInstance';
import type { RuleRunReturn } from '../../utils/RuleRunReturn';
import type { StandardSchemaV1 } from 'vest-utils/standardSchemaSpec';
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
 * Minimal structural schema-member rule. Method syntax keeps parameters
 * bivariant so concrete rules stay assignable, while full member coverage
 * lets Pick<S, K> / Omit<S, K> satisfy the PickRuleInstance /
 * OmitRuleInstance constraints with fully precise types.
 */
export interface SchemaMemberRule {
  infer: unknown;
  test(value: unknown): boolean;
  run(value: unknown, ...rest: unknown[]): RuleRunReturn<unknown>;
  validate(
    value: unknown,
    ...rest: unknown[]
  ): StandardSchemaV1.Result<unknown>;
  parse(value: unknown, ...rest: unknown[]): unknown;
  '~standard': StandardSchemaV1.Props<unknown, unknown> & {
    readonly types: StandardSchemaV1.Types<unknown, unknown>;
  };
  dependsOn(resolver: (scope: ScopeHandle) => unknown): SchemaMemberRule;
  describe(): DescribeResult;
}

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
  pick: <S extends Record<string, SchemaMemberRule>, K extends keyof S>(
    schema: S,
    keys: readonly K[] | K,
  ) => PickRuleInstance<Pick<S, K>>;
  omit: <S extends Record<string, SchemaMemberRule>, K extends keyof S>(
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
