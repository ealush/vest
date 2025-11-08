import { mapFirst } from 'vest-utils';

import { RuleInstance } from 'RuleInstance';
import { RuleRunReturn } from 'RuleRunReturn';

/**
 * Validates that a value passes at least one of the provided rules.
 * At least one rule must pass for the validation to succeed.
 * Evaluation stops at the first passing rule.
 * 
 * @template T - The value type to validate
 * @param value - The value to validate
 * @param rules - One or more RuleInstances where at least one must pass
 * @returns RuleRunReturn indicating success or failure
 * 
 * @example
 * ```typescript
 * // Eager API
 * enforce('hello')
 *   .anyOf(
 *     enforce.isNumber(),
 *     enforce.isString()
 *   ); // passes (string matches)
 * 
 * // Lazy API - accept either format
 * const phoneOrEmailRule = enforce.anyOf(
 *   enforce.isString().matches(/^\d{10}$/), // phone
 *   enforce.isString().matches(/@/) // email
 * );
 * 
 * phoneOrEmailRule.test('1234567890'); // true
 * phoneOrEmailRule.test('user@example.com'); // true
 * phoneOrEmailRule.test('invalid'); // false
 * ```
 */
export function anyOf<T>(value: T, ...rules: any[]): RuleRunReturn<T> {
  return (
    mapFirst(rules, (rule, breakout) => {
      const res = rule.run(value);
      breakout(res.pass, res);
    }) || RuleRunReturn.Failing(value)
  );
}

// Type for anyOf rule instance
export type AnyOfRuleInstance<T> = RuleInstance<T, [T]>;
