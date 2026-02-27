/**
 * Module: `src/rules/compoundRules/allOf.ts`.
 *
 * Provides `allOf`-related runtime and type utilities used by `n4s`.
 */
import { mapFirst } from 'vest-utils';

import { RuleInstance } from '../../utils/RuleInstance';
import { RuleRunReturn } from '../../utils/RuleRunReturn';

/**
 * Validates that a value passes all of the provided rules.
 * All rules must pass for the validation to succeed.
 * Evaluation stops at the first failing rule.
 *
 * @template T - The value type to validate
 * @param value - The value to validate
 * @param rules - One or more RuleInstances that must all pass
 * @returns RuleRunReturn indicating success or failure
 *
 * @example
 * ```typescript
 * // Eager API
 * enforce(25)
 *   .allOf(
 *     enforce.isNumber().greaterThan(18).lessThan(100)
 *   ); // passes (all rules pass)
 *
 * // Lazy API
 * const adultAgeRule = enforce.allOf(
 *   enforce.isNumber().greaterThanOrEquals(18).lessThan(150)
 * );
 *
 * adultAgeRule.test(25); // true
 * adultAgeRule.test(16); // false
 * adultAgeRule.test('25'); // false (not a number)
 * ```
 */
export function allOf<T>(value: T, ...rules: any[]): RuleRunReturn<T> {
  return (
    mapFirst(rules, (rule, breakout) => {
      const res = rule.run(value);
      breakout(!res.pass, res);
    }) || RuleRunReturn.Passing(value)
  );
}

// Type for allOf rule instance
export type AllOfRuleInstance<T> = RuleInstance<T, [T]>;
