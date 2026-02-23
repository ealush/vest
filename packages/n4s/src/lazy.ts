import { FirstParam } from './eager/typeUtils';
import { ctx } from './enforceContext';
import { adaptDynamicRules } from './lazy/ruleAdapter';
import { typeRules } from './lazy/typeRules';
import type { CustomMatcherArgs } from './n4sTypes';
import type { ArrayRuleInstance } from './rules/arrayRules';
import * as arrayRules from './rules/arrayRules';
import * as compoundRules from './rules/compoundRules/compoundRules';
import type { CompoundRuleLazyTypes } from './rules/compoundRules/compoundRules';
import { addToChain } from './rules/genRuleChain';
import { AnyRuleInstance } from './rules/generalRules';
import * as generalRules from './rules/generalRules';
import type { ObjectRulesUnion } from './rules/objectRules';
import * as objectRules from './rules/objectRules';
import * as schemaRules from './rules/schemaRules/schemaRules';
import type { SchemaRuleLazyTypes } from './rules/schemaRules/schemaRules';
import { type RuleInstance } from './utils/RuleInstance';
import { RuleRunReturn } from './utils/RuleRunReturn';

/**
 * Extracts the output type from a custom matcher function.
 * If the matcher returns { type: T }, uses T (coercion rules like toNumber).
 * Otherwise falls back to the first parameter type (validation rules like isPositive).
 */
type InferMatcherOutput<K extends keyof n4s.EnforceMatchers> =
  ReturnType<Extract<n4s.EnforceMatchers[K], (...args: any[]) => any>> extends {
    type: infer T;
  }
    ? T
    : FirstParam<n4s.EnforceMatchers[K]>;

type TCustomLazyRules = {
  [K in keyof n4s.EnforceMatchers as K extends keyof SchemaRuleLazyTypes
    ? never
    : K extends keyof CompoundRuleLazyTypes
      ? never
      : K]: (
    ...args: CustomMatcherArgs<K>
  ) => RuleInstance<
    InferMatcherOutput<K>,
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
  ) as CompoundRuleLazyTypes),
  ...(schemaRulesWithArrayChaining as SchemaRuleLazyTypes),
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
