import { mapFirst } from 'vest-utils';

import { RuleInstance } from '../../utils/RuleInstance';
import { RuleRunReturn } from '../../utils/RuleRunReturn';

/**
 * Validates that a value passes none of the provided rules.
 * All rules must fail for the validation to succeed.
 * Evaluation stops at the first passing rule.
 *
 * @template T - The value type to validate
 * @param value - The value to validate
 * @param rules - One or more RuleInstances that must all fail
 * @returns RuleRunReturn indicating success or failure
 *
 * @example
 * ```typescript
 * // Eager API
 * enforce(0)
 *   .noneOf(
 *     enforce.greaterThan(0),
 *     enforce.lessThan(0)
 *   ); // passes (neither rule passes)
 *
 * // Lazy API - exclude reserved usernames
 * const notReservedRule = enforce.noneOf(
 *   enforce.equals('admin'),
 *   enforce.equals('root'),
 *   enforce.equals('system')
 * );
 *
 * notReservedRule.test('john'); // true
 * notReservedRule.test('admin'); // false
 * notReservedRule.test('root'); // false
 * ```
 */
export function noneOf<T>(value: T, ...rules: any[]): RuleRunReturn<T> {
  return (
    mapFirst(rules, (rule, breakout) => {
      const res = rule.run(value);
      breakout(res.pass, RuleRunReturn.Failing(value));
    }) || RuleRunReturn.Passing(value)
  );
}

// Type for noneOf rule instance
export type NoneOfRuleInstance<T> = RuleInstance<T, [T]>;
