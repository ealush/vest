import { assign } from 'vest-utils';

import { enforceEager } from './eager';
import { ctx } from './enforceContext';
import type { EnforceContext } from './enforceContext';
import { extendEnforce } from './extendLogic';
import { enforceLazy } from './lazy';
import type { RuleInstance } from './utils/RuleInstance';

/**
 * Context API for accessing validation context.
 * Allows accessing metadata and parent validation context during rule execution.
 */
export { ctx } from './enforceContext';

/**
 * Compose multiple validation rules into a single reusable rule.
 * Returns a composed rule that can be used in both eager and lazy validation.
 *
 * @example
 * ```typescript
 * // Compose separate rules that apply to the same value
 * const isValidUsername = compose(
 *   enforce.isString()
 *     .longerThan(3)
 *     .shorterThan(20)
 *     .matches(/^[a-zA-Z0-9_]+$/)
 * );
 *
 * isValidUsername.test('john_doe'); // true
 * isValidUsername.test('ab'); // false (too short)
 * isValidUsername.test('john doe'); // false (contains space)
 *
 * // Use in schema validation
 * enforce({ username: 'john_doe' }).shape({
 *   username: isValidUsername
 * });
 * ```
 */
export { compose } from './compose';

/**
 * Public schema relationship introspection types.
 * Returned by `describe()` on schema rules.
 */
export type {
  ItemSegment,
  PropertySegment,
  SchemaPath,
} from './schema/SchemaPath';
export type {
  InternalRelationship,
  SchemaDependency,
  SchemaRelationship,
} from './schema/SchemaRelationship';
export type { DescribeResult } from './utils/RuleInstance';

/**
 * Escape hatch for referencing a literal field whose name collides with a
 * JavaScript internal (`then` is never chainable so refs stay non-thenable).
 *
 * @example
 * ```typescript
 * dependsOn($ => $[FIELD]('then'))
 * ```
 */
export { FIELD } from './schema/scopeProxy';

type ExtendFn = (rules: Record<string, (...args: any[]) => any>) => void;
type ContextFn = () => EnforceContext;
type Enforce = typeof enforceEager &
  typeof enforceLazy & { extend: ExtendFn; context: ContextFn };

export namespace enforce {
  export type infer<R extends RuleInstance<any, any>> = R['infer'];
}

/**
 * Main validation function supporting both eager (imperative) and lazy (builder) APIs.
 *
 * **Eager API (Imperative):**
 * Immediately validates a value with chainable assertions that execute on call.
 *
 * **Lazy API (Builder Pattern):**
 * Builds a reusable validation rule without a value, returns a RuleInstance.
 *
 * @example
 * ```typescript
 * // Eager API - validates immediately
 * enforce('hello').isString().longerThan(3);
 *
 * // Lazy API - builds a reusable rule
 * const stringRule = enforce.isString();
 * stringRule.test('hello'); // true
 * stringRule.run('hello'); // RuleRunReturn { pass: true, type: 'hello' }
 *
 * // Custom messages
 * enforce('').message('Field is required').isNotEmpty();
 *
 * // Schema validation
 * enforce({ name: 'John', age: 30 }).shape({
 *   name: enforce.isString(),
 *   age: enforce.isNumber()
 * });
 * ```
 */
export const enforce = assign(enforceEager, enforceLazy) as Enforce;

/**
 * Access the current validation context.
 * Returns metadata and parent context information during rule execution.
 *
 * @returns The current EnforceContext or null if not in validation context
 *
 * @example
 * ```typescript
 * const context = enforce.context();
 * console.log(context?.value); // Current value being validated
 * console.log(context?.meta);  // Metadata attached to context
 * ```
 */
enforce.context = function context(): EnforceContext {
  return ctx.use();
};

/**
 * Extend enforce with custom validation rules.
 * Custom rules become available on both eager and lazy APIs.
 *
 * @param rules - Object mapping rule names to validation functions
 *
 * @example
 * ```typescript
 * enforce.extend({
 *   isPositive: (value: number) => value > 0,
 *   isBetween: (value: number, min: number, max: number) =>
 *     value >= min && value <= max
 * });
 *
 * // Now use your custom rules
 * enforce(5).isPositive(); // eager API
 * const rule = enforce.isPositive(); // lazy API
 *
 * // With TypeScript, declare types:
 * declare global {
 *   namespace n4s {
 *     interface EnforceMatchers {
 *       isPositive: (value: number) => boolean;
 *       isBetween: (value: number, min: number, max: number) => boolean;
 *     }
 *   }
 * }
 * ```
 */
enforce.extend = function extend(
  rules: Record<string, (...args: any[]) => any>,
) {
  extendEnforce(enforce, rules);
};
