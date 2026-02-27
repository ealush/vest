/**
 * Module: `src/rules/compoundRules/oneOf.ts`.
 *
 * Provides `oneOf`-related runtime and type utilities used by `n4s`.
 */
import { greaterThan } from 'vest-utils';

import { RuleInstance } from '../../utils/RuleInstance';
import { RuleRunReturn } from '../../utils/RuleRunReturn';

const REQUIRED_COUNT = 1;

/**
 * Validates that a value passes exactly one of the provided rules.
 * Exactly one rule must pass - not zero, not two or more.
 * All rules are evaluated to count passing rules.
 *
 * @template T - The value type to validate
 * @param value - The value to validate
 * @param rules - One or more RuleInstances where exactly one must pass
 * @returns RuleRunReturn indicating success or failure
 *
 * @example
 * ```typescript
 * // Eager API
 * enforce(5)
 *   .oneOf(
 *     enforce.lessThan(10),
 *     enforce.greaterThan(100)
 *   ); // passes (only first rule passes)
 *
 * // Lazy API - accept either type but not both
 * const stringOrNumberRule = enforce.oneOf(
 *   enforce.isString(),
 *   enforce.isNumber()
 * );
 *
 * stringOrNumberRule.test('hello'); // true
 * stringOrNumberRule.test(42); // true
 * stringOrNumberRule.test(true); // false (no rules pass)
 *
 * // More complex example - exclusive validation
 * const exclusiveRule = enforce.oneOf(
 *   enforce.equals(null),
 *   enforce.isString().longerThan(0)
 * );
 *
 * exclusiveRule.test(null); // true (exactly one passes)
 * exclusiveRule.test('hello'); // true (exactly one passes)
 * exclusiveRule.test(''); // false (neither passes)
 * ```
 */
export function oneOf<T>(value: T, ...rules: any[]): RuleRunReturn<T> {
  let passingCount = 0;
  rules.some(rule => {
    const res = rule.run(value);

    if (res.pass) {
      passingCount++;
    }

    if (greaterThan(passingCount, REQUIRED_COUNT)) {
      return RuleRunReturn.Failing(value);
    }
  });

  return RuleRunReturn.create(passingCount === REQUIRED_COUNT, value);
}

// Type for oneOf rule instance
export type OneOfRuleInstance<T> = RuleInstance<T, [T]>;
