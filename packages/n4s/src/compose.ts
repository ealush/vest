import { StringObject, assign, invariant, mapFirst } from 'vest-utils';

import { ctx } from './enforceContext';
import {
  ITEM_CONTAINER,
  ITEM_SCHEMA,
  RESOLVED_RELATIONSHIPS,
  UNRESOLVED_DEPS,
} from './schema/dependencyResolver';
import { RuleInstance } from './utils/RuleInstance';
import { RuleRunReturn } from './utils/RuleRunReturn';

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

  // A single composite keeps its identity through composition: forward the
  // schema slots so mounting the composed rule as a shape field preserves
  // its dependency graph, item schema, and container kind. Multiple
  // composites are intentionally left unmerged — their graphs would need
  // union semantics that compose() does not define.
  if (composites.length === 1 && composites[0]) {
    forwardSchemaSlots(composites[0], composedFn as ComposeResult<T>);
  }

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

/**
 * Forwards the schema slots from a single composite onto the composed
 * rule. Relationship lists are copied so later mounts cannot alias the
 * source's arrays; plain slots carry over by reference.
 */
function forwardSchemaSlots<T>(
  source: RuleInstance<unknown, [unknown]>,
  target: ComposeResult<T>,
): void {
  const from = source as unknown as Record<PropertyKey, unknown>;
  const to = target as unknown as Record<PropertyKey, unknown>;
  for (const slot of [UNRESOLVED_DEPS, RESOLVED_RELATIONSHIPS]) {
    const entries = from[slot];
    if (Array.isArray(entries)) to[slot] = [...entries];
  }
  for (const slot of ['__schema', ITEM_SCHEMA, ITEM_CONTAINER]) {
    if (from[slot] !== undefined) to[slot] = from[slot];
  }
}
