/* eslint-disable max-nested-callbacks */
import { mapFirst } from 'vest-utils';

import { ctx } from '../../enforceContext';
import { RuleRunReturn } from '../../utils/RuleRunReturn';

/**
 * Validates that a value is an array and all elements match at least one of the provided rules.
 * Each array element must pass at least one of the validation rules.
 *
 * @template T - The element type of the array
 * @param value - The array to validate
 * @param rules - One or more RuleInstances that elements should match
 * @returns RuleRunReturn indicating success or failure
 *
 * @example
 * ```typescript
 * // Eager API - array of strings
 * enforce(['a', 'b', 'c'])
 *   .isArrayOf(enforce.isString()); // passes
 *
 * enforce([1, 2, 'three'])
 *   .isArrayOf(enforce.isString()); // fails
 *
 * // Lazy API - array of numbers or strings
 * const mixedArrayRule = enforce.isArrayOf(
 *   enforce.isNumber(),
 *   enforce.isString()
 * );
 *
 * mixedArrayRule.test([1, 'two', 3, 'four']); // true
 * mixedArrayRule.test([1, 2, true]); // false (boolean not allowed)
 *
 * // Complex schema validation
 * const usersRule = enforce.isArrayOf(
 *   enforce.shape({
 *     name: enforce.isString(),
 *     age: enforce.isNumber()
 *   })
 * );
 *
 * usersRule.test([
 *   { name: 'John', age: 30 },
 *   { name: 'Jane', age: 25 }
 * ]); // true
 * ```
 */
// eslint-disable-next-line max-nested-callbacks
export function isArrayOf<T>(value: T[], ...rules: any[]): RuleRunReturn<T[]> {
  if (!Array.isArray(value)) {
    return RuleRunReturn.Failing(value);
  }

  return (
    mapFirst(value, (item, breakout, index) => {
      const res = ctx.run({ value: item, set: true, meta: { index } }, () => {
        let lastRes: RuleRunReturn<any> | undefined;
        // Try each rule with the item - any rule passing is OK
        const anyPass = rules.some(rule => {
          lastRes = rule.run(item);
          return lastRes.pass;
        });

        if (anyPass) {
          return RuleRunReturn.Passing(item);
        }

        // If failed and we have a single rule, return its failure (might contain nested path)
        if (rules.length === 1 && lastRes) {
          return lastRes;
        }

        return RuleRunReturn.Failing(item);
      });

      if (!res.pass) {
        const currentPath = res.path || [];
        const newRes = { ...res, path: [index.toString(), ...currentPath] };
        breakout(true, newRes);
      }
    }) || RuleRunReturn.Passing(value)
  );
}

// Type for isArrayOf rule instance - should chain array rules like isArray does
export type IsArrayOfRuleInstance<T> =
  import('../arrayRules').ArrayRuleInstance<T>;
