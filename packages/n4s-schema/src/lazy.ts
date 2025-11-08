import { ctx } from 'enforceContext';

import { type RuleInstance } from 'RuleInstance';
import { RuleRunReturn } from 'RuleRunReturn';
import type { ArrayRuleInstance } from 'arrayRules';
import * as arrayRules from 'arrayRules';
import * as compoundRules from 'compoundRules';
import type { CompoundRuleLazyTypes } from 'compoundRules';
import { addToChain } from 'genRuleChain';
import { AnyRuleInstance } from 'generalRules';
import * as generalRules from 'generalRules';
import type { CustomMatcherArgs } from 'n4sTypes';
import type { ObjectRulesUnion } from 'objectRules';
import * as objectRules from 'objectRules';
import { adaptDynamicRules } from 'ruleAdapter';
import * as schemaRules from 'schemaRules';
import type { SchemaRuleLazyTypes } from 'schemaRules';
import { typeRules } from 'typeRules';
import { FirstParam } from 'typeUtils';

/**
 * Maps custom rules to lazy API signatures (builder pattern).
 * Excludes schema and compound rules (they have special handling).
 */
type TCustomLazyRules = {
  [K in keyof n4s.EnforceMatchers as K extends keyof SchemaRuleLazyTypes
    ? never
    : K extends keyof CompoundRuleLazyTypes
      ? never
      : K]: (
    ...args: CustomMatcherArgs<K>
  ) => RuleInstance<
    FirstParam<n4s.EnforceMatchers[K]>,
    [FirstParam<n4s.EnforceMatchers[K]>]
  >;
};

// Create schema rules with isArrayOf handled specially
const adaptedSchemaRules = adaptDynamicRules<
  RuleInstance<any, [any]>,
  typeof schemaRules
>(schemaRules);

// Override isArrayOf to chain array rules
const schemaRulesWithArrayChaining = {
  ...adaptedSchemaRules,
  isArrayOf: <T>(...rules: any[]): ArrayRuleInstance<T> =>
    addToChain<ArrayRuleInstance<T>>(arrayRules as any, (value: any) => {
      const result = ctx.run({ value }, () =>
        schemaRules.isArrayOf(value, ...rules),
      );
      return RuleRunReturn.create(result, value);
    }),
};

const baseEnforceLazy = {
  ...(adaptDynamicRules<RuleInstance<any, [any]>, typeof compoundRules>(
    compoundRules,
  ) as unknown as CompoundRuleLazyTypes),
  ...(schemaRulesWithArrayChaining as unknown as SchemaRuleLazyTypes),
  ...adaptDynamicRules<AnyRuleInstance, typeof generalRules>(generalRules),
  ...adaptDynamicRules<ObjectRulesUnion, typeof objectRules>(objectRules),
  ...typeRules,
};

export const enforceLazy = baseEnforceLazy as unknown as TCustomLazyRules &
  typeof baseEnforceLazy;
