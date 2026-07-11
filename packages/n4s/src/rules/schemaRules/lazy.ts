import { ctx } from '../../enforceContext';
import { RuleInstance } from '../../utils/RuleInstance';
import { RuleRunReturn } from '../../utils/RuleRunReturn';
import { addToChain } from '../genRuleChain';

export type LazyRuleInstance<T> = RuleInstance<T, [T]>;

/**
 * Creates a lazy schema wrapper for recursive/self-referencing schemas.
 * The factory function is called on first validation and cached.
 *
 * @param factory - A function that returns the RuleInstance to delegate to
 * @returns A RuleInstance that defers schema resolution to validation time
 *
 * @example
 * ```typescript
 * type Category = { name: string; children: Category[] };
 *
 * const categorySchema = enforce.shape({
 *   name: enforce.isString(),
 *   children: enforce.isArrayOf(enforce.lazy(() => categorySchema)),
 * });
 *
 * categorySchema.test({
 *   name: 'Root',
 *   children: [
 *     { name: 'Child', children: [] },
 *   ],
 * }); // true
 * ```
 */
export function lazy<T>(
  factory: () => RuleInstance<T, any>,
): LazyRuleInstance<T> {
  let cached: RuleInstance<T, any> | null = null;

  const resolve = (): RuleInstance<T, any> => {
    if (!cached) {
      cached = factory();
    }
    return cached;
  };

  return addToChain<LazyRuleInstance<T>>(
    {},
    (value: any) => {
      const result = ctx.run({ value }, () => resolve().run(value));
      return RuleRunReturn.create(result, value);
    },
    { args: [factory], rule: 'lazy' },
  );
}
