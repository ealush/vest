import { RuleInstance } from './utils/RuleInstance';
import { RuleRunReturn } from './utils/RuleRunReturn';
import { ctx } from './enforceContext';
import { StringObject, assign, invariant, mapFirst } from 'vest-utils';

type ComposeResult<T = any> = RuleInstance<T, [T]> & {
  (value: T): void;
};

/**
 * Composes multiple validation rules into a single reusable rule.
 * The composed rule executes rules in order and fails on the first failing rule.
 * Returns a RuleInstance that can be used with both eager and lazy APIs.
 *
 * @template T - The type of value to validate
 * @param composites - Validation rules to compose
 * @returns A composed rule that can be run with values or called directly
 *
 * @example
 * ```typescript
 * // Create a reusable adult age validation
 * const isAdult = compose(
 *   enforce.isNumber(),
 *   enforce.greaterThanOrEquals(18),
 *   enforce.lessThan(150)
 * );
 *
 * // Use with lazy API
 * isAdult.test(25); // true
 * isAdult.test(16); // false
 *
 * // Use with eager API
 * enforce(30).run(isAdult); // passes
 *
 * // Call directly (throws on failure)
 * isAdult(25); // ok
 * isAdult(16); // throws
 *
 * // Compose with other rules
 * const userSchema = enforce.shape({
 *   age: isAdult,
 *   name: enforce.isString()
 * });
 * ```
 */
export function compose<T = any>(
  ...composites: RuleInstance<any, [any]>[]
): ComposeResult<T> {
  const composedFn = assign(
    (value: T) => {
      const res = run(value);
      invariant(res.pass, StringObject(res.message));
    },
    {
      run,
      test: (value: T) => run(value).pass,
      infer: {} as T,
    },
  );

  return composedFn as ComposeResult<T>;

  function run(value: T): RuleRunReturn<T> {
    return ctx.run({ value }, () => {
      let result: RuleRunReturn<T> = RuleRunReturn.Passing(value);

      mapFirst(
        composites,
        (
          composite: RuleInstance<any, [any]>,
          breakout: (conditional: boolean, res: RuleRunReturn<any>) => void,
        ) => {
          const res = composite.run(value);
          if (!res.pass) {
            result = res;
            breakout(true, res);
          }
        },
      );

      return result;
    });
  }
}
