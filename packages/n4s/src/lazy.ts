import { type RuleInstance } from 'RuleInstance';
import { RuleRunReturn } from 'RuleRunReturn';
import type { ArrayRuleInstance } from 'arrayRules';
import * as arrayRules from 'arrayRules';
import * as compoundRules from 'compoundRules';
import type { CompoundRuleLazyTypes } from 'compoundRules';
import { ctx } from 'enforceContext';
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
 * Type mapping for custom rules in the lazy (builder) API.
 * Excludes schema and compound rules as they have special handling.
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

/**
 * Lazy (builder) API for creating reusable validation rules.
 * Rules are created without a value and can be executed later with `run()` or `test()`.
 *
 * This is the builder pattern side of the enforce API - rules are chainable and reusable.
 *
 * @example
 * ```typescript
 * // Create reusable rules
 * const stringRule = enforce.isString();
 * const emailRule = enforce.isString().matches(/@/);
 *
 * // Test with values
 * stringRule.test('hello'); // true
 * stringRule.test(123); // false
 *
 * // Run for detailed results
 * const result = emailRule.run('user@example.com');
 * console.log(result.pass); // true
 *
 * // Chain type-specific rules
 * const ageRule = enforce.isNumber()
 *   .greaterThanOrEquals(18)
 *   .lessThan(150);
 *
 * // Schema validation
 * const userSchema = enforce.shape({
 *   name: enforce.isString(),
 *   email: enforce.isString().matches(/@/),
 *   age: ageRule
 * });
 *
 * userSchema.test({ name: 'John', email: 'john@example.com', age: 25 }); // true
 * ```
 */
export const enforceLazy = baseEnforceLazy as unknown as TCustomLazyRules &
  typeof baseEnforceLazy;
